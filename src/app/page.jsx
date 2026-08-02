import { createClient } from '@supabase/supabase-js';
import HomeClient from '../components/HomeClient';

// Initialize Supabase on the server
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const revalidate = 60; // Refresh cache every 60 seconds

export default async function HomePage() {
  let initialImage = null;
  // Fallback times just in case the database is completely empty
  let initialIqama = { fajr: '06:00', dhuhr: '13:45', asr: '18:30', isha: '21:45' }; 
  
  try {
    // 1. Fetch Hero Image
    const { data: imgData } = await supabase
      .from('site_images')
      .select('image_url')
      .eq('section', 'home_hero')
      .single();
      
    if (imgData) {
      initialImage = imgData.image_url;
    }

    // 2. Fetch Active Iqama Schedule
    // Finds the most recent schedule where the effective date is today or earlier
    const today = new Date().toISOString().split('T')[0];
    const { data: iqamaData, error: iqamaError } = await supabase
      .from('iqama_schedule')
      .select('*')
      .lte('effective_date', today)
      .order('effective_date', { ascending: false })
      .limit(1)
      .single();

    if (iqamaData) {
      initialIqama = {
        fajr: iqamaData.fajr,
        dhuhr: iqamaData.dhuhr,
        asr: iqamaData.asr,
        isha: iqamaData.isha
      };
    }
  } catch (error) {
    console.error("Failed to fetch data on server:", error);
  }

  // Pass BOTH the image and the iqama times to the client
  return <HomeClient initialBgImage={initialImage} initialIqama={initialIqama} />;
}