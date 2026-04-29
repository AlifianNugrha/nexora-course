import { supabase } from "@/lib/supabase";

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
  const { data, error } = await supabase
    .from("form_submissions")
    .insert([formData])
    .select();

  if (error) throw error;
  return data[0];
}
