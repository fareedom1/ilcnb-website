"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Users, MapPin, Send } from 'lucide-react';

export default function AboutPage() {
  const leaders = [
    { name: "Imam Bismil", role: "Imam" },
    { name: "Syed Sharafat Ali", role: "President" },
    { name: "Babar Shahzad", role: "Vice President" }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full space-y-24">
      
      {/* Mission Section */}
      <section className="flex flex-col md:flex-row gap-12 items-center">
        <div className="md:w-1/2 space-y-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-stone-900">Our Story & Mission</h2>
          <div className="space-y-4 text-stone-600 text-lg leading-relaxed">
            <p>
              Established in 2020, the Islamic Learning Center of North Broward (ILCNB) was founded to provide a welcoming space for our local Muslim community to worship, learn, and grow together in accordance with the Quran and the Sunnah of Prophet Muhammad (PBUH).
            </p>
            <p>
              Over the years, our ummah has rapidly grown across four major cities—Parkland, Coconut Creek, Deerfield Beach, and Boca Raton—areas previously without a close place of worship.
            </p>
            <p>
              Alhamdulillah, our congregation has grown so rapidly that we consistently reach maximum capacity during our weekly Jummah prayers and Ramadan Iftars. As we look to the future, we are actively pursuing plans to expand our facilities to accommodate our thriving community and serve it as a place of worship and learning.
            </p>
          </div>
        </div>
        <div className="md:w-1/2 w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl relative group">
          <img 
            src="https://images.pexels.com/photos/8164383/pexels-photo-8164383.jpeg?auto=compress&cs=tinysrgb&w=1280" 
            alt="Open Quran" 
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-emerald-900/10 mix-blend-multiply pointer-events-none" />
        </div>
      </section>

      {/* Leadership Section */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-stone-900">Leadership & Administration</h2>
          <div className="w-24 h-1 bg-emerald-500 mx-auto mt-4 rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {leaders.map((leader, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 text-center flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-stone-100 rounded-full mb-6 flex items-center justify-center text-stone-400">
                <Users size={32} />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-1">{leader.name}</h3>
              <p className="text-emerald-600 font-semibold uppercase tracking-wider text-sm">{leader.role}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact & Location Section */}
      <section className="bg-stone-900 rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row shadow-2xl">
        <div className="md:w-1/3 p-10 md:p-14 flex flex-col justify-center text-white space-y-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Visit Us</h2>
            <p className="text-stone-400">Our doors are open to the community.</p>
          </div>
          <div className="space-y-6">
            <div className="flex items-start">
              <MapPin className="text-emerald-500 mr-4 mt-1 flex-shrink-0" size={24} />
              <div>
                <strong className="block text-lg mb-1">Address</strong>
                <p className="text-stone-300 leading-relaxed">4405 W Hillsboro Blvd<br />Coconut Creek, FL 33073</p>
              </div>
            </div>
            <div className="flex items-start">
              <Send className="text-emerald-500 mr-4 mt-1 flex-shrink-0" size={24} />
              <div>
                <strong className="block text-lg mb-1">Email</strong>
                <a href="mailto:contact@ilcnb.org" className="text-stone-300 hover:text-emerald-400 transition-colors">contact@ilcnb.org</a>
              </div>
            </div>
          </div>
        </div>
        <div className="md:w-2/3 h-[400px] md:h-auto min-h-[400px]">
          <iframe 
            src="https://www.google.com/maps?q=4405+W+Hillsboro+Blvd,+Coconut+Creek,+FL+33073&output=embed" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="ILCNB Map Location"
          ></iframe>
        </div>
      </section>
    </div>
  );
}
