const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://ybkprcpivuoawdjoipuw.supabase.co";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlia3ByY3BpdnVvYXdkam9pcHV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NTUyOTQsImV4cCI6MjA5MzAzMTI5NH0.gj5cQzge_avtOOqF5mK4f-WBxK4KEAFECrKOUWtlIUc";

const supabase = createClient(supabaseUrl, anonKey, {
  auth: {
    persistSession: false
  }
});

async function run() {
  try {
    // Fetch questions
    console.log("Fetching exam_questions...");
    const { data: questions, error: questionsError } = await supabase
      .from("exam_questions")
      .select("*");

    if (questionsError) {
      console.error("Error fetching questions:", questionsError);
    } else {
      console.log("Questions count:", questions?.length);
      console.log("Questions data:", JSON.stringify(questions, null, 2));
    }

  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

run();
