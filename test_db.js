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
    // 1. Sign up a random user
    const email = `test_${Math.floor(Math.random() * 1000000)}@nexora.id`;
    const password = "SuperSecretPassword123!";
    console.log("Signing up temporary user:", email);
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      throw signUpError;
    }
    console.log("Sign up success, UID:", signUpData.user?.id);

    // 2. Try fetching attempts
    console.log("Fetching exam_attempts...");
    const { data: attempts, error: attemptsError } = await supabase
      .from("exam_attempts")
      .select("*");

    if (attemptsError) {
      console.error("Error fetching attempts:", attemptsError);
    } else {
      console.log("Attempts count:", attempts?.length);
      console.log("Attempts data:", JSON.stringify(attempts, null, 2));
    }

    // 3. Try fetching with user_profiles join
    console.log("Fetching exam_attempts with user_profiles...");
    const { data: joinData, error: joinError } = await supabase
      .from("exam_attempts")
      .select(`
        id,
        score,
        finished_at,
        user_id,
        exam_id,
        user_profiles (
          full_name,
          email
        )
      `);
    if (joinError) {
      console.error("Error fetching with join:", joinError);
    } else {
      console.log("Join results:", JSON.stringify(joinData, null, 2));
    }

  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

run();
