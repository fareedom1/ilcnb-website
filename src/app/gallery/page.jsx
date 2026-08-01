"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, ImageIcon, Loader2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function GalleryPage() {
  const [images, setImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch images on page load
  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    const { data, error } = await supabase
      .from('gallery_images')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching images:', error);
    } else {
      setImages(data || []);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    
    // Create a unique file name to prevent overwriting
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      // 1. Upload to Supabase Storage (Bucket must be named 'gallery')
      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get the public URL of the uploaded image
      const { data: publicUrlData } = supabase.storage
        .from('gallery')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      // 3. Save the URL to our Database table
      const { error: dbError } = await supabase
        .from('gallery_images')
        .insert([{ image_url: publicUrl }]);

      if (dbError) throw dbError;

      // 4. Refresh the gallery to show the new image
      fetchImages();
    } catch (error) {
      console.error('Upload failed:', error.message);
      alert('Failed to upload image. Check console for details.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full space-y-16">
      
      {/* Header & Temporary Admin Upload */}
      <section className="text-center space-y-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-stone-900">Community Gallery</h2>
          <div className="w-24 h-1 bg-emerald-500 mx-auto mt-4 rounded-full" />
        </div>
        
        <p className="text-stone-600 max-w-2xl mx-auto text-lg">
          Moments captured from our community events, prayers, and gatherings.
        </p>

        {/* Upload Button (To be moved to Admin Dashboard later) */}
        <div className="pt-4 flex justify-center">
          <label className={`
            relative cursor-pointer inline-flex items-center space-x-2 px-6 py-3 
            rounded-full font-semibold text-white transition-all duration-300
            ${isUploading ? 'bg-stone-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg hover:-translate-y-0.5'}
          `}>
            {isUploading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Upload size={20} />
            )}
            <span>{isUploading ? 'Uploading...' : 'Upload Image'}</span>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileUpload} 
              disabled={isUploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
            />
          </label>
        </div>
      </section>

      {/* Masonry Gallery Grid */}
      <section>
        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-stone-400 space-y-4 bg-stone-50 rounded-[2.5rem] border border-dashed border-stone-200">
            <ImageIcon size={48} className="opacity-50" />
            <p className="text-lg">No images yet. Be the first to upload!</p>
          </div>
        ) : (
          /* 
             CSS Columns handle the Masonry layout natively. 
             break-inside-avoid prevents images from being sliced across columns. 
          */
          <div className="columns-1 sm:columns-2 md:columns-3 gap-6 space-y-6">
            {images.map((img) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="break-inside-avoid rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-stone-100 bg-white"
              >
                <img 
                  src={img.image_url} 
                  alt="Community moment" 
                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </motion.div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}