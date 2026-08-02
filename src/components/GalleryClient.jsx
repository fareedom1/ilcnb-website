"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ImageIcon } from 'lucide-react';

export default function GalleryClient({ initialImages }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full min-h-[70vh]">
      <div className="mb-12 text-center cursor-default">
        <h1 className="text-4xl font-extrabold text-stone-800 tracking-tight mb-4">Community Gallery</h1>
        <p className="text-lg text-stone-600 max-w-2xl mx-auto">Moments and memories from our vibrant community.</p>
      </div>

      {/* If there are no images, show this beautiful empty state */}
      {!initialImages || initialImages.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center bg-stone-50 border-2 border-dashed border-stone-200 rounded-3xl p-16 text-center cursor-default max-w-2xl mx-auto"
        >
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
            <ImageIcon size={40} />
          </div>
          <h3 className="text-2xl font-bold text-stone-800 mb-2">No photos yet</h3>
          <p className="text-stone-500">Our gallery is currently empty. Check back soon for new community moments!</p>
        </motion.div>
      ) : (
        /* If there ARE images, show the grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {initialImages.map((img, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="aspect-square rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer group bg-stone-100 border border-stone-200"
            >
              <img
                src={img.image_url}
                alt={`Community Moment ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}