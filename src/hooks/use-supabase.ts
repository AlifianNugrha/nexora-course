import { supabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

const isValidUUID = (id: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

export async function fetchCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });
  
  if (error) throw error;
  return data || [];
}

export async function fetchCourses() {
  const { data, error } = await supabase
    .from("courses")
    .select("*, categories(*)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  
  // Map Supabase relation to match the app's expectation (cat name instead of ID)
  return data.map(course => ({
    ...course,
    category: course.categories?.name || "Uncategorized"
  })) || [];
}

export async function fetchCourseById(id: string) {
  if (!isValidUUID(id)) {
    console.error("Invalid UUID:", id);
    return null;
  }

  // Try with categories join first
  const { data, error } = await supabase
    .from("courses")
    .select("*, categories(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching course (with join):", error);
    // Fallback: try without join
    const { data: fallback, error: fallbackError } = await supabase
      .from("courses")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    
    if (fallbackError || !fallback) {
      console.error("Error fetching course (fallback):", fallbackError);
      return null;
    }
    return { ...fallback, category: "Uncategorized" };
  }
  
  if (!data) return null;
  
  return {
    ...data,
    category: data.categories?.name || "Uncategorized"
  };
}

export async function fetchSchedules() {
  const { data, error } = await supabase
    .from("schedules")
    .select("*, courses(*)")
    .order("date", { ascending: true });

  if (error) throw error;
  
  return data.map(schedule => ({
    ...schedule,
    course_name: schedule.courses?.title || "Unknown Course"
  })) || [];
}

export async function checkNewSchedules() {
  const lastSeen = localStorage.getItem("last_seen_schedule_id");
  const { data, error } = await supabase
    .from("schedules")
    .select("id")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return false;
  return data.id !== lastSeen;
}

export function markSchedulesAsSeen(id: string) {
  if (id) localStorage.setItem("last_seen_schedule_id", id);
}

export async function fetchMaterialsByCourseId(courseId: string) {
  if (!isValidUUID(courseId)) return [];

  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .eq("course_id", courseId)
    .eq("is_published", true)
    .order("order", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function fetchCategory(slug: string) {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data;
}

export async function fetchCoursesByCategory(categoryName: string) {
  const { data, error } = await supabase
    .from("courses")
    .select("*, categories!inner(*)")
    .eq("categories.name", categoryName);

  if (error) throw error;
  
  return data.map(course => ({
    ...course,
    category: course.categories?.name || "Uncategorized"
  })) || [];
}

export async function fetchSchedulesByCourse(courseId: string) {
  if (!isValidUUID(courseId)) return [];

  const { data, error } = await supabase
    .from("schedules")
    .select("*")
    .eq("course_id", courseId)
    .order("date", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function submitForm(formData: any) {
  const { data: { session } } = await supabase.auth.getSession();
  const submission = {
    ...formData,
    user_id: session?.user?.id || null
  };
  
  const { data, error } = await supabase
    .from("form_submissions")
    .insert([submission])
    .select();

  if (error) throw error;
  return data[0];
}

export async function deleteSubmission(id: string) {
  const { error } = await supabase
    .from("form_submissions")
    .delete()
    .eq("id", id);
  
  if (error) throw error;
}

export async function fetchEvents() {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });
  
  if (error) {
    console.error("Error fetching events:", error);
    return [];
  }
  return data || [];
}

export async function fetchGallery() {
  const { data, error } = await supabase
    .from("gallery")
    .select("*, categories:category_id(id, name, slug)")
    .order("created_at", { ascending: false });
  
  if (error) {
    console.error("Error fetching gallery:", error);
    return [];
  }
  return (data || []).map(item => ({
    ...item,
    division_name: item.categories?.name || null,
    division_slug: item.categories?.slug || null,
  }));
}

export async function fetchGalleryByDivision(categoryId: string) {
  const { data, error } = await supabase
    .from("gallery")
    .select("*, categories:category_id(id, name, slug)")
    .eq("category_id", categoryId)
    .order("created_at", { ascending: false });
  
  if (error) {
    console.error("Error fetching gallery by division:", error);
    return [];
  }
  return (data || []).map(item => ({
    ...item,
    division_name: item.categories?.name || null,
    division_slug: item.categories?.slug || null,
  }));
}

export async function checkRegistration(email: string, eventTitle: string, userId?: string) {
  if (!eventTitle) return false;
  
  let query = supabase
    .from("form_submissions")
    .select("id")
    .eq("event_name", eventTitle);

  if (userId) {
    // If we have userId, check by EITHER userId or email
    query = query.or(`user_id.eq.${userId},email.eq.${email}`);
  } else if (email) {
    query = query.eq("email", email);
  } else {
    return false;
  }

  const { data, error } = await query.limit(1).maybeSingle();

  if (error) return false;
  return !!data;
}

// ═══════════════════════════════════════════════════════════
// USER MANAGEMENT FUNCTIONS (for Super Admin)
// ═══════════════════════════════════════════════════════════

export async function fetchAllUsers() {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*, categories:division_id(id, name)")
    .order("created_at", { ascending: false });
  
  if (error) {
    console.error("Error fetching users:", error);
    return [];
  }
  return data || [];
}

export async function updateUserProfile(userId: string, updates: {
  role?: string;
  division_id?: string | null;
  is_verified?: boolean;
  full_name?: string;
  active_title?: string | null;
}) {
  const { data, error } = await supabase
    .from("user_profiles")
    .upsert(
      { id: userId, ...updates, updated_at: new Date().toISOString() },
      { onConflict: "id" }
    )
    .select()
    .single();

  if (error) {
    console.error("updateUserProfile error:", error);
    throw error;
  }
  return data;
}

export async function createUserAccount(userData: {
  email: string;
  password: string;
  full_name: string;
  role: string;
  division_id: string | null;
  is_verified: boolean;
}) {
  // Create a separate Supabase client to avoid logging out the admin
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Sign up the new user with the temp client
  const { data, error } = await tempClient.auth.signUp({
    email: userData.email,
    password: userData.password,
    options: {
      data: {
        full_name: userData.full_name,
        role: userData.role,
        is_verified: userData.is_verified,
      },
    },
  });

  if (error) throw error;

  // The trigger handle_new_user() will auto-create user_profiles row
  // But we need to update division_id since it's not in auth metadata trigger
  if (data.user && userData.division_id) {
    // Wait a moment for the trigger to execute
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await supabase
      .from("user_profiles")
      .update({
        division_id: userData.division_id,
        role: userData.role,
        is_verified: userData.is_verified,
        full_name: userData.full_name,
      })
      .eq("id", data.user.id);
  }

  return data;
}

export async function deleteUserAccount(userId: string) {
  // Delete profile first (cascade should handle this, but be safe)
  await supabase
    .from("user_profiles")
    .delete()
    .eq("id", userId);

  // Note: Deleting from auth.users requires service_role key
  // This will only delete the profile, not the auth user
  // Full deletion needs to be done from Supabase dashboard
}

// ═══════════════════════════════════════════════════════════
// ABSENSI (SUBMISSIONS) WITH FILTERS
// ═══════════════════════════════════════════════════════════

export async function fetchAbsensi(filters?: {
  course?: string;
  class_name?: string;
  category_id?: string;
}) {
  let query = supabase
    .from("form_submissions")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.course) {
    query = query.or(`course.eq.${filters.course},event_name.eq.${filters.course}`);
  }
  if (filters?.class_name) {
    query = query.eq("class_name", filters.class_name);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching absensi:", error);
    return [];
  }
  return data || [];
}

export async function fetchDistinctCourseNames() {
  const { data, error } = await supabase
    .from("form_submissions")
    .select("course, event_name")
    .order("created_at", { ascending: false });

  if (error) return [];
  
  const names = new Set<string>();
  (data || []).forEach(row => {
    if (row.event_name) names.add(row.event_name);
    else if (row.course) names.add(row.course);
  });
  return Array.from(names);
}

export async function fetchDistinctClassNames(courseName?: string) {
  let query = supabase
    .from("form_submissions")
    .select("class_name");
  
  if (courseName) {
    query = query.or(`course.eq.${courseName},event_name.eq.${courseName}`);
  }

  const { data, error } = await query;
  if (error) return [];
  
  const names = new Set<string>();
  (data || []).forEach(row => {
    if (row.class_name) names.add(row.class_name);
  });
  return Array.from(names).sort();
}

// ═══════════════════════════════════════════════════════════
// EXAM SYSTEM
// ═══════════════════════════════════════════════════════════

export async function fetchExams() {
  const { data, error } = await supabase
    .from("exams")
    .select("*, courses(id, title)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchExamById(id: string) {
  if (!isValidUUID(id)) return null;
  const { data, error } = await supabase
    .from("exams")
    .select("*, courses(id, title)")
    .eq("id", id)
    .maybeSingle();
  if (error) { console.error("Error fetching exam:", error); return null; }
  return data;
}

export async function fetchExamsByCourseId(courseId: string) {
  if (!isValidUUID(courseId)) return [];
  const { data, error } = await supabase
    .from("exams")
    .select("*")
    .eq("course_id", courseId)
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  if (error) return [];
  return data || [];
}

export async function createExam(examData: any) {
  const { data, error } = await supabase
    .from("exams")
    .insert([examData])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateExam(id: string, examData: any) {
  const { data, error } = await supabase
    .from("exams")
    .update({ ...examData, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteExam(id: string) {
  const { error } = await supabase.from("exams").delete().eq("id", id);
  if (error) throw error;
}

// ═══════════════════════════════════════════════════════════
// EXAM QUESTIONS
// ═══════════════════════════════════════════════════════════

export async function fetchQuestionsByExamId(examId: string) {
  if (!isValidUUID(examId)) return [];
  const { data, error } = await supabase
    .from("exam_questions")
    .select("*")
    .eq("exam_id", examId)
    .order("order", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createQuestion(questionData: any) {
  const { data, error } = await supabase
    .from("exam_questions")
    .insert([questionData])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateQuestion(id: string, questionData: any) {
  const { data, error } = await supabase
    .from("exam_questions")
    .update(questionData)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteQuestion(id: string) {
  const { error } = await supabase.from("exam_questions").delete().eq("id", id);
  if (error) throw error;
}

export async function bulkCreateQuestions(examId: string, questions: any[]) {
  const rows = questions.map((q, i) => ({
    exam_id: examId,
    question: q.question,
    option_a: q.option_a,
    option_b: q.option_b,
    option_c: q.option_c,
    option_d: q.option_d,
    correct_answer: q.correct_answer.toLowerCase(),
    order: i + 1,
    points: q.points || 1,
  }));
  const { data, error } = await supabase
    .from("exam_questions")
    .insert(rows)
    .select();
  if (error) throw error;
  return data || [];
}

export async function fetchQuestionCountByExamId(examId: string) {
  const { count, error } = await supabase
    .from("exam_questions")
    .select("*", { count: "exact", head: true })
    .eq("exam_id", examId);
  if (error) return 0;
  return count || 0;
}

// ═══════════════════════════════════════════════════════════
// EXAM ATTEMPTS & ANSWERS
// ═══════════════════════════════════════════════════════════

export async function createAttempt(examId: string, userId: string) {
  const { data, error } = await supabase
    .from("exam_attempts")
    .insert([{ exam_id: examId, user_id: userId, started_at: new Date().toISOString() }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function submitAttempt(
  attemptId: string,
  answers: { question_id: string; selected_answer: string | null }[],
  questions: any[],
  timeSpentSeconds: number
) {
  // 1. Grade answers
  const gradedAnswers = answers.map((ans) => {
    const question = questions.find((q: any) => q.id === ans.question_id);
    const isCorrect = question
      ? ans.selected_answer === question.correct_answer
      : false;
    return {
      attempt_id: attemptId,
      question_id: ans.question_id,
      selected_answer: ans.selected_answer,
      is_correct: isCorrect,
    };
  });

  // 2. Insert answers
  const { error: ansError } = await supabase
    .from("exam_answers")
    .insert(gradedAnswers);
  if (ansError) throw ansError;

  // 3. Calculate score
  const totalCorrect = gradedAnswers.filter((a) => a.is_correct).length;
  const totalQuestions = questions.length;
  const score = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

  // 4. Update attempt
  const { data: attempt, error: attemptError } = await supabase
    .from("exam_attempts")
    .update({
      score: Math.round(score * 100) / 100,
      total_correct: totalCorrect,
      total_questions: totalQuestions,
      finished_at: new Date().toISOString(),
      is_submitted: true,
      time_spent_seconds: timeSpentSeconds,
    })
    .eq("id", attemptId)
    .select()
    .single();
  if (attemptError) throw attemptError;

  return attempt;
}

export async function fetchAttemptsByUser(userId: string) {
  const { data, error } = await supabase
    .from("exam_attempts")
    .select("*, exams(id, title, course_id, passing_score, duration_minutes, courses(id, title))")
    .eq("user_id", userId)
    .eq("is_submitted", true)
    .order("finished_at", { ascending: false });
  if (error) return [];
  return data || [];
}

export async function fetchAttemptsByExam(examId: string) {
  const { data, error } = await supabase
    .from("exam_attempts")
    .select("*, user_profiles:user_id(full_name)")
    .eq("exam_id", examId)
    .eq("is_submitted", true)
    .order("score", { ascending: false });
  if (error) return [];
  return data || [];
}

export async function fetchLeaderboardByExam(examId: string) {
  if (!isValidUUID(examId)) return [];

  const { data, error } = await supabase
    .from("exam_attempts")
    .select("id, user_id, score, total_correct, total_questions, time_spent_seconds, finished_at, user_profiles(full_name, active_title, email)")
    .eq("exam_id", examId)
    .eq("is_submitted", true);

  if (error) {
    console.error("fetchLeaderboardByExam error:", error);
    // Fallback: fetch without the join so at least we get scores
    const { data: fallback, error: fallbackError } = await supabase
      .from("exam_attempts")
      .select("id, user_id, score, total_correct, total_questions, time_spent_seconds, finished_at")
      .eq("exam_id", examId)
      .eq("is_submitted", true);
    if (fallbackError || !fallback) return [];
    return fallback
      .map(row => ({ ...row, user_profiles: null }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (a.time_spent_seconds || 9999) - (b.time_spent_seconds || 9999);
      });
  }

  // Keep only the BEST attempt per user (highest score, then fastest time)
  const bestPerUser = new Map<string, any>();
  for (const row of (data || [])) {
    const existing = bestPerUser.get(row.user_id);
    if (!existing) {
      bestPerUser.set(row.user_id, row);
    } else {
      const isBetter = row.score > existing.score ||
        (row.score === existing.score && (row.time_spent_seconds || 9999) < (existing.time_spent_seconds || 9999));
      if (isBetter) bestPerUser.set(row.user_id, row);
    }
  }

  // Sort: score DESC, then time ASC
  return Array.from(bestPerUser.values()).sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (a.time_spent_seconds || 9999) - (b.time_spent_seconds || 9999);
  });
}

export async function fetchBestScore(examId: string, userId: string) {
  const { data, error } = await supabase
    .from("exam_attempts")
    .select("score")
    .eq("exam_id", examId)
    .eq("user_id", userId)
    .eq("is_submitted", true)
    .order("score", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return data.score;
}

export async function fetchAttemptDetail(attemptId: string) {
  const { data: attempt, error: aErr } = await supabase
    .from("exam_attempts")
    .select("*, exams(id, title, passing_score, course_id)")
    .eq("id", attemptId)
    .single();
  if (aErr) throw aErr;

  const { data: answers, error: ansErr } = await supabase
    .from("exam_answers")
    .select("*, exam_questions(*)")
    .eq("attempt_id", attemptId);
  if (ansErr) throw ansErr;

  return { attempt, answers: answers || [] };
}

export async function fetchUserAttemptCountForExam(examId: string, userId: string) {
  const { count, error } = await supabase
    .from("exam_attempts")
    .select("*", { count: "exact", head: true })
    .eq("exam_id", examId)
    .eq("user_id", userId)
    .eq("is_submitted", true);
  if (error) return 0;
  return count || 0;
}

// ═══════════════════════════════════════════════════════════
// BADGE SYSTEM
// ═══════════════════════════════════════════════════════════

export async function fetchAllBadges() {
  const { data, error } = await supabase
    .from("badges")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) return [];
  return data || [];
}

export async function fetchUserBadges(userId: string) {
  const { data, error } = await supabase
    .from("user_badges")
    .select("*, badges(*)")
    .eq("user_id", userId)
    .order("earned_at", { ascending: false });
  if (error) return [];
  return data || [];
}

async function awardBadge(userId: string, badgeSlug: string, examId?: string | null) {
  // Get badge by slug
  const { data: badge } = await supabase
    .from("badges")
    .select("id")
    .eq("slug", badgeSlug)
    .single();
  if (!badge) return null;

  // Insert (ignore conflict = already earned)
  const { data, error } = await supabase
    .from("user_badges")
    .upsert(
      {
        user_id: userId,
        badge_id: badge.id,
        exam_id: examId || null,
        earned_at: new Date().toISOString(),
      },
      { onConflict: "user_id,badge_id,exam_id" }
    )
    .select("*, badges(*)")
    .single();
  if (error) { console.error("Badge award error:", error); return null; }
  return data;
}

export async function checkAndAwardBadges(
  userId: string,
  examId: string,
  score: number,
  _timeSpentSeconds: number,
  _durationMinutes: number
): Promise<any[]> {
  const newBadges: any[] = [];

  // Award ONLY the custom badge configured by admin for this specific exam
  // Admin sets the badge via Badge Settings in AdminExamPanel
  try {
    const { data: examDataObj } = await supabase
      .from("exams")
      .select("passing_score")
      .eq("id", examId)
      .maybeSingle();

    const minPass = examDataObj?.passing_score ?? 70;
    if (score >= minPass) {
      // Look for badge with slug `exam_{examId}` (created by admin via Badge Settings)
      const { data: customBadge } = await supabase
        .from("badges")
        .select("slug")
        .eq("slug", `exam_${examId}`)
        .maybeSingle();

      if (customBadge) {
        const b = await awardBadge(userId, customBadge.slug, examId);
        if (b) newBadges.push(b);
      }
      // No badge configured for this exam = no badge awarded (expected behavior)
    }
  } catch (err) {
    console.error("Error checking custom exam badge:", err);
  }

  return newBadges;
}

export async function updateActiveTitle(userId: string, title: string | null) {
  const { error } = await supabase
    .from("user_profiles")
    .update({ active_title: title, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) {
    console.error("updateActiveTitle error:", error);
    throw error;
  }
}

export async function fetchUserProfile(userId: string) {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*, categories:division_id(name)")
    .eq("id", userId)
    .maybeSingle();
  if (error) return null;
  return data;
}

export async function fetchExamBadge(examId: string) {
  const { data, error } = await supabase
    .from("badges")
    .select("*")
    .eq("slug", `exam_${examId}`)
    .maybeSingle();
  if (error) return null;
  return data;
}

export async function saveExamBadge(examId: string, badgeData: { name: string, icon: string, description: string, color?: string }) {
  const slug = `exam_${examId}`;
  const { data, error } = await supabase
    .from("badges")
    .upsert({
      slug,
      name: badgeData.name,
      icon: badgeData.icon,
      description: badgeData.description,
      color: badgeData.color || "violet",
      category: "exam"
    }, { onConflict: "slug" })
    .select()
    .single();
  if (error) throw error;
  return data;
}
