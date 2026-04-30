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
}) {
  const { data, error } = await supabase
    .from("user_profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
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
