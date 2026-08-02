import { createClient } from '@supabase/supabase-js';
import GalleryClient from '../../components/GalleryClient';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const revalidate = 60; // Refresh cache every 60 seconds

export default async function GalleryPage() {
  let initialImages = [];
  
  try {
    // Fetch all images, newest first!
    const { data, error } = await supabase
      .from('gallery_images')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (data) {
      initialImages = data;
    }
    if (error) {
      console.error("Supabase error:", error.message);
    }
  } catch (error) {
    console.error("Failed to fetch gallery images on server:", error);
  }

  // Pass the images (or an empty array) straight to the client component
  return <GalleryClient initialImages={initialImages} />;
}