"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, BookOpen, Heart, Send } from 'lucide-react';

export default function EventsPage() {
  const events = [
    {
      title: "Jummah Prayer",
      category: "General",
      date: "Every Friday",
      time: "1:30 PM",
      description: "Weekly congregational prayer and khutbah. Please arrive early as space fills up quickly.",
      icon: Users
    },
    {
      title: "Isha Prayer Lecture",
      category: "Learning",
      date: "Every Day",
      time: "After Isha",
      description: "Daily short lecture and reflection after Isha prayer.",
      icon: BookOpen
    },
    {
      title: "Ramadan Iftar",
      category: "Community",
      date: "Saturday & Sunday",
      time: "Maghrib",
      description: "Join us for community Iftar during the blessed month of Ramadan.",
      icon: Heart
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold text-stone-800 tracking-tight mb-4">Upcoming Events</h1>
        <p className="text-lg text-stone-600 max-w-2xl mx-auto">Join us for prayer, education, and community gatherings.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-stone-100 overflow-hidden flex flex-col"
          >
            <div className="bg-emerald-600 h-2 w-full" />
            <div className="p-6 flex-grow">
              <div className="flex justify-between items-start mb-4">
                <span className="inline-block bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full font-semibold tracking-wide uppercase">
                  {event.category}
                </span>
                <event.icon className="text-stone-300" size={24} />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-2">{event.title}</h3>
              <div className="space-y-2 mb-4 text-sm text-stone-600 font-medium">
                <div className="flex items-center"><Calendar size={16} className="mr-2 text-emerald-500" /> {event.date}</div>
                <div className="flex items-center"><Clock size={16} className="mr-2 text-emerald-500" /> {event.time}</div>
              </div>
              <p className="text-stone-600 text-sm leading-relaxed">{event.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-24 mb-8 flex flex-col md:flex-row items-center gap-10 md:gap-16">
        <div className="w-full md:w-1/2">
          <div className="relative rounded-[2.5rem] overflow-hidden shadow-xl aspect-[4/3] group">
            <img 
              src="https://images.pexels.com/photos/8164382/pexels-photo-8164382.jpeg?auto=compress&cs=tinysrgb&w=1280" 
              alt="Community Gathering" 
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-emerald-900/10 mix-blend-multiply pointer-events-none" />
          </div>
        </div>
        
        <div className="w-full md:w-1/2 space-y-6 text-center md:text-left">
          <div className="inline-block bg-emerald-100 text-emerald-800 text-xs px-4 py-2 rounded-full font-bold tracking-widest uppercase mb-2">
            Community Space
          </div>
          <h3 className="text-3xl md:text-4xl font-extrabold text-stone-900 leading-tight">
            Host Your Next Event With Us
          </h3>
          <p className="text-stone-600 text-lg leading-relaxed">
            Our facilities are available for community gatherings, educational halaqas, and special occasions. We would love to help you plan and host your next event. Contact us at <strong>contact@ilcnb.org</strong>.
          </p>
          
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
            <a 
              href="mailto:contact@ilcnb.org" 
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-8 rounded-full transition-all duration-300 w-full sm:w-auto flex items-center justify-center gap-3 shadow-lg hover:shadow-emerald-600/30 hover:-translate-y-1"
            >
              <Send size={18} />
              Email Us
            </a>
            <span className="text-stone-500 font-medium">or speak with us in person</span>
          </div>
        </div>
      </div>
    </div>
  );
}
