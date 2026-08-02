import { createClient } from '@supabase/supabase-js';
import EventsClient from '../../components/EventsClient';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const revalidate = 60; // Refresh cache every 60 seconds

export default async function EventsPage() {
  let initialImage = null;
  
  try {
    const { data } = await supabase
      .from('site_images')
      .select('image_url')
      .eq('section', 'events_main')
      .single();
      
    if (data) {
      initialImage = data.image_url;
    }
  } catch (error) {
    console.error("Failed to fetch events image on server:", error);
  }

  return <EventsClient initialBgImage={initialImage} />;
}