"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Calendar, Info, HeartHandshake, Home } from 'lucide-react';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { id: '/', label: 'Home', icon: Home },
    { id: '/events', label: 'Events', icon: Calendar },
    { id: '/about', label: 'About', icon: Info },
    { id: '/donate', label: 'Support', icon: HeartHandshake }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-emerald-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          
          {/* Logo area */}
          <Link 
            href="/"
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <img 
              src="/logo.png" 
              alt="ILCNB Logo" 
              className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.onerror = null; 
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            {/* Fallback box if image is missing */}
            <div className="hidden w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl items-center justify-center text-white font-bold shadow-lg shadow-emerald-200 group-hover:scale-105 transition-transform duration-300">
              <span className="text-lg sm:text-xl tracking-tighter">ILC</span>
            </div>
            <span className="text-[13px] sm:text-[15px] md:text-xl lg:text-2xl font-extrabold tracking-tight text-black leading-snug max-w-[200px] sm:max-w-none">
              Islamic Learning Center of North Broward
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-2 lg:space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                href={link.id}
                className={`relative px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  pathname === link.id ? 'text-emerald-900' : 'text-stone-500 hover:text-emerald-700 hover:bg-stone-50'
                }`}
              >
                {pathname === link.id && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute inset-0 bg-emerald-100 rounded-full"
                    style={{ zIndex: 0 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            ))}
          </nav>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-stone-600 hover:text-emerald-600 focus:outline-none p-2 bg-emerald-50 rounded-lg transition-colors cursor-pointer"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-stone-100 overflow-hidden shadow-xl"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.id}
                  href={link.id}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center w-full px-4 py-3 rounded-xl text-base font-medium transition-colors cursor-pointer ${
                    pathname === link.id 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'text-stone-600 hover:bg-stone-50 hover:text-emerald-600'
                  }`}
                >
                  <link.icon className="mr-3 h-5 w-5 opacity-70" />
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
