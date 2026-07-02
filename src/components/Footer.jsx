"use client";

import React from 'react';
import Link from 'next/link';
import { MapPin, Send } from 'lucide-react';

export default function Footer() {
  const navLinks = [
    { id: '/', label: 'Home' },
    { id: '/events', label: 'Events' },
    { id: '/about', label: 'About' },
    { id: '/donate', label: 'Support' }
  ];

  return (
    <footer className="bg-stone-950 text-stone-300 py-16 mt-auto border-t border-stone-900 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-emerald-900/20 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Left Column (Brand & Contact) */}
          <div className="md:col-span-8 lg:col-span-9 flex flex-col space-y-8">
            <div>
              <h3 className="text-3xl font-extrabold text-white tracking-tight mb-4 flex items-center gap-3">
                <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" onError={(e) => e.target.style.display='none'} />
                ILCNB
              </h3>
              <p className="text-stone-400 max-w-md leading-relaxed text-lg">
                Islamic Learning Center of North Broward. A welcoming place of worship, community growth, and learning. We welcome all to especially join us at Fajr, Maghrib, and Isha for daily prayers.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-12 text-sm text-stone-400 mt-2">
              <div className="flex items-start group cursor-default">
                <div className="p-2.5 bg-stone-900 rounded-xl mr-4 group-hover:bg-emerald-900/40 transition-colors border border-stone-800">
                  <MapPin size={20} className="text-emerald-500" />
                </div>
                <div>
                  <span className="block font-semibold text-stone-300 mb-0.5 text-base">Location</span>
                  <span className="leading-relaxed">4405 W Hillsboro Blvd<br />Coconut Creek, FL 33073</span>
                </div>
              </div>
              <div className="flex items-start group">
                <div className="p-2.5 bg-stone-900 rounded-xl mr-4 group-hover:bg-emerald-900/40 transition-colors border border-stone-800">
                  <Send size={20} className="text-emerald-500" />
                </div>
                <div>
                  <span className="block font-semibold text-stone-300 mb-0.5 text-base">Contact</span>
                  <a href="mailto:contact@ilcnb.org" className="hover:text-emerald-400 transition-colors leading-relaxed">contact@ilcnb.org</a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Links) */}
          <div className="md:col-span-4 lg:col-span-3">
            <h4 className="text-white font-bold mb-6 tracking-widest uppercase text-sm border-b border-stone-800 pb-3 inline-block">Quick Links</h4>
            <nav className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.id}
                  href={link.id}
                  className="text-stone-400 hover:text-emerald-400 hover:translate-x-2 transition-all font-medium text-left cursor-pointer flex items-center w-max group text-base"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/0 group-hover:bg-emerald-500 mr-3 transition-colors"></span>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="border-t border-stone-800/80 w-full mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-stone-500 select-none">
          <p>© {new Date().getFullYear()} Islamic Learning Center of North Broward.</p>
          <p>Peace be upon you.</p>
        </div>
      </div>
    </footer>
  );
}
