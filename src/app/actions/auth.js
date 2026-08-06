"use server";

import { createClient } from '@supabase/supabase-js';

export async function verifyAdminPassword(inputPassword) {
  // Initialize Supabase using the private Service Role Key to bypass RLS
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Fetch the password from the database
    const { data, error } = await supabase
      .from('admin_settings')
      .select('setting_value')
      .eq('setting_name', 'admin_password')
      .single();

    if (error || !data) {
      return { success: false, error: "Database configuration error." };
    }

    // Compare the database password with what the user typed
    if (inputPassword === data.setting_value) {
      return { success: true };
    }

    return { success: false, error: "Incorrect password." };
    
  } catch (err) {
    return { success: false, error: "An unexpected error occurred." };
  }
}