"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PrayerHUD from '../components/PrayerHUD';

export default function HomePage() {
  const [timings, setTimings] = useState(null);
  const [currentPrayer, setCurrentPrayer] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // HUD States
  const [hudState, setHudState] = useState("floating-footer");
  const [upcomingEvent, setUpcomingEvent] = useState(null);
  const [headerHeight, setHeaderHeight] = useState(113);
  const hudRef = useRef(null);
  const wrapperRef = useRef(null);
  const tableRef = useRef(null);

  // Prayer Calculation Logic
  useEffect(() => {
    const fetchPrayers = async () => {
      const dateStr = new Date().toISOString().split('T')[0];
      const cacheKey = `prayerTimes_${dateStr}`;
      const cached = localStorage.getItem(cacheKey);

      if (cached) {
        processTimings(JSON.parse(cached));
      } else {
        try {
          const url = 'https://api.aladhan.com/v1/timingsByCity?city=Coconut%20Creek&country=United%20States&state=Florida&method=1&school=1';
          const res = await fetch(url);
          const data = await res.json();
          localStorage.setItem(cacheKey, JSON.stringify(data.data.timings));
          processTimings(data.data.timings);
        } catch (error) {
          console.error("Failed to fetch prayer times:", error);
          processTimings({"Fajr":"05:30","Sunrise":"06:45","Dhuhr":"13:30","Asr":"17:00","Maghrib":"20:15","Isha":"21:30"});
        }
      }
    };
    fetchPrayers();
  }, []);

  const processTimings = (apiTimings) => {
    const required = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const filtered = {};
    required.forEach(p => filtered[p] = apiTimings[p]);
    setTimings(filtered);

    const now = new Date();
    const nowMs = now.getTime();
    
    let current = null;
    let nextEvt = null;

    const getTimestamp = (time24, addDays = 0) => {
      if (!time24) return null;
      const [h, m] = time24.split(':').map(Number);
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
      if (addDays !== 0) d.setDate(d.getDate() + addDays);
      return d.getTime();
    };

    const prayerOrder = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    
    // Convert all to a structured array
    const structuredPrayers = prayerOrder.map(name => {
      const adhanTime24 = filtered[name];
      const iqamahTime24 = calculateIqama24(adhanTime24, name);
      return {
        name,
        adhanTime24,
        iqamahTime24,
        adhan: format12H(adhanTime24),
        iqamah: calculateIqama(adhanTime24, name)
      };
    });

    for (let i = 0; i < structuredPrayers.length; i++) {
      const p = structuredPrayers[i];
      const adhanTs = getTimestamp(p.adhanTime24);
      const iqamahTs = getTimestamp(p.iqamahTime24);
      
      if (nowMs < adhanTs) {
        nextEvt = { ...p, type: 'adhan', targetTime: adhanTs };
        current = i === 0 ? structuredPrayers[structuredPrayers.length - 1] : structuredPrayers[i - 1];
        break;
      } else if (iqamahTs && nowMs < iqamahTs) {
        nextEvt = { ...p, type: 'iqamah', targetTime: iqamahTs };
        current = p;
        break;
      }
    }

    if (!nextEvt) {
       const fajr = structuredPrayers[0];
       const tomorrowFajrTs = getTimestamp(fajr.adhanTime24, 1);
       nextEvt = { ...fajr, type: 'adhan', targetTime: tomorrowFajrTs };
       current = structuredPrayers[structuredPrayers.length - 1];
    }
    
    setCurrentPrayer(current);
    setUpcomingEvent(nextEvt);
    setLoading(false);
  };

  const calculateIqama24 = (time24, prayerName) => {
    if (prayerName === 'Dhuhr' || prayerName === 'Asr') return null;
    let [h, m] = time24.split(':').map(Number);
    let date = new Date();
    date.setHours(h, m, 0);

    if (prayerName === 'Maghrib') {
      date.setMinutes(date.getMinutes() + 3);
    } else {
      date.setMinutes(date.getMinutes() + 10);
      let mins = date.getMinutes();
      let remainder = mins % 10;
      if (remainder !== 0) {
        date.setMinutes(mins + (10 - remainder));
      }
    }
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const calculateIqama = (time24, prayerName) => {
    if (prayerName === 'Dhuhr' || prayerName === 'Asr') return '--:--';
    const time24Iqama = calculateIqama24(time24, prayerName);
    return format12H(time24Iqama);
  };

  const format12H = (time24) => {
    if (!time24) return '--:--';
    let [h, m] = time24.split(':').map(Number);
    let date = new Date();
    date.setHours(h, m, 0);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  // Run timing recalculation every second
  useEffect(() => {
    if (loading) return;
    const interval = setInterval(() => {
      // Reprocess timings to update current and upcoming dynamically
      // We rely on the already fetched timings in the state
      if (timings) processTimings(timings);
    }, 1000);
    return () => clearInterval(interval);
  }, [loading, timings]);

  useEffect(() => {
    if (loading) return;

    const handleScroll = () => {
      const tableElement = tableRef.current;
      if (!tableElement) return;

      const tableRect = tableElement.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const scrollY = window.scrollY;
      
      // tableAbsoluteTop is the top of the entire section (which includes wrapperRef)
      const tableAbsoluteTop = tableRect.top + scrollY;

      // Calculate HUD height and Header height dynamically
      const hudHeight = hudRef.current ? hudRef.current.offsetHeight : (window.innerWidth >= 640 ? 69 : 58);
      const headerEl = document.querySelector('header');
      const currentHeaderHeight = headerEl ? headerEl.offsetHeight : (window.innerWidth >= 640 ? 113 : 72);
      
      setHeaderHeight(currentHeaderHeight);

      if (wrapperRef.current) {
        wrapperRef.current.style.height = `${hudHeight}px`;
      }

      let newState = "floating-footer";
      const bottomOffset = 24; // bottom-6

      // Floating HUD bottom: scrollY + viewportHeight - bottomOffset
      // Docked HUD bottom: tableAbsoluteTop + hudHeight
      // Add a 40px magnetic snap threshold so it docks slightly earlier before visually overlapping
      const magneticSnapOffset = 40;
      if (scrollY + viewportHeight - bottomOffset < tableAbsoluteTop + hudHeight + magneticSnapOffset) {
        newState = "floating-footer";
      } else if (scrollY + currentHeaderHeight >= tableAbsoluteTop) {
        newState = "sticky-header";
      } else {
        newState = "docked";
      }

      setHudState(newState);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll();
    
    const timer = setTimeout(handleScroll, 150);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      clearTimeout(timer);
    };
  }, [loading]);

  return (
    <div className="w-full flex flex-col items-center pb-20">
      
      {/* 
        HERO SECTION 
        Responsive height: 100vh on desktop minus header.
        Responsive alignment: justify-start with top padding on mobile, justify-center on desktop.
      */}
      <div className="w-full relative min-h-[calc(100vh-5rem)] flex flex-col items-center justify-start pt-28 md:justify-center md:pt-0 pb-32 px-4 overflow-hidden bg-emerald-50">
        
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-[center_top_-4rem] md:bg-center"
          style={{
            backgroundImage: `url('https://images.pexels.com/photos/2236674/pexels-photo-2236674.jpeg?auto=compress&cs=tinysrgb&w=2560')`
          }}
        />
        
        {/* 1. White Base Overlay */}
        <div className="absolute inset-0 z-0 bg-white/70 backdrop-blur-[2px]" />
        
        {/* 2. Very Light Green Gradient */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-emerald-50/40 via-emerald-50/10 to-emerald-50/80" />

        <div className="relative z-10 w-full max-w-4xl flex flex-col items-center md:mt-8">
          
          {/* Core Hero Text */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center w-full flex flex-col items-center"
          >
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-black italic drop-shadow-sm px-2 mb-6 sm:mb-8">
              May the peace, mercy and blessings of Allah (God) be upon you.
            </h2>
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-black font-serif leading-tight">
              السلام عليكم ورحمة الله وبركاته
            </h1>
            <div className="inline-flex items-center justify-center text-black font-medium text-[10px] sm:text-xs mt-6 sm:mt-8 mb-10 text-center px-1 whitespace-nowrap tracking-wider uppercase">
              4405 W Hillsboro Blvd, Coconut Creek, FL 33073
            </div>
          </motion.div>
        </div>
      </div>

      {/* Prayer Times Section */}
      <div className="w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)] lg:w-[calc(100%-4rem)] max-w-[960px] mx-auto mt-12 sm:mt-16 z-20 relative" ref={tableRef}>
        
        {/* Dynamic height wrapper for HUD to prevent layout shifts */}
        <div ref={wrapperRef} className="relative w-full z-20">
          {upcomingEvent && (
            <PrayerHUD hudState={hudState} hudRef={hudRef} upcomingEvent={upcomingEvent} headerHeight={headerHeight} />
          )}
        </div>

        <motion.div 
          id="daily-prayer-matrix"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className={`bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden border border-emerald-100 relative z-10 ${
            hudState === "docked" ? "rounded-b-3xl rounded-t-none border-t-0" : "rounded-3xl"
          }`}
        >
          {/* Table Header Area - Very Light Green */}
          <div className="bg-emerald-50 px-4 sm:px-6 py-5 sm:py-6 text-center border-b border-emerald-100">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-black">Today's Prayer Times</h3>
            <p className="text-emerald-800 text-xs sm:text-sm mt-1 opacity-90">Coconut Creek, FL • University of Islamic Sciences, Karachi Hanafi Method</p>
          </div>
          
          {/* Table Content - White Background */}
          <div className="p-0 sm:p-2 bg-white">
            {loading ? (
              <div className="flex justify-center py-20 text-emerald-600">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
              </div>
            ) : (
              <div className="w-full overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-emerald-200/60 text-emerald-800/80 text-xs sm:text-sm uppercase tracking-wider bg-white">
                      <th className="px-3 sm:px-6 py-3 sm:py-4 font-semibold">Prayer</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 font-semibold">Adhan</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 font-semibold">Iqama</th>
                    </tr>
                  </thead>
                  <tbody className="text-stone-800 bg-white">
                    {timings && Object.entries(timings)
                      .filter(([prayer]) => prayer !== 'Sunrise')
                      .map(([prayer, time]) => {
                      const isNext = upcomingEvent?.name === prayer;
                      const isCurrent = currentPrayer?.name === prayer;

                      return (
                        <tr 
                          key={prayer} 
                          className={`border-b border-emerald-100/50 transition-colors bg-white hover:bg-emerald-50 ${
                            isNext ? 'bg-emerald-50/80 border-l-4 border-l-emerald-500' : ''
                          } ${
                            isCurrent ? 'bg-stone-50 border-l-4 border-l-stone-300' : ''
                          }`}
                        >
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <div className="flex items-center font-bold text-base sm:text-lg">
                              <span>{prayer}</span>
                              {isNext && <span className="ml-2 sm:ml-3 text-[8px] sm:text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white px-2 py-0.5 sm:py-1 rounded-full shadow-sm">Next</span>}
                              {isCurrent && <span className="ml-2 sm:ml-3 text-[8px] sm:text-[10px] font-black uppercase tracking-wider bg-stone-200 text-stone-600 px-2 py-0.5 sm:py-1 rounded-full">Current</span>}
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 font-medium text-sm sm:text-base text-stone-700 whitespace-nowrap">
                            {format12H(time)}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 font-bold text-sm sm:text-base text-emerald-700 whitespace-nowrap">
                            {calculateIqama(time, prayer)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
        
        {/* Jummah Callout Cards */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-4 sm:mt-6 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Khutbah Card */}
          <div className="bg-white rounded-3xl border border-emerald-100 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between shadow-md text-center md:text-left">
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-4 sm:mb-0">
              <div className="bg-emerald-50 w-12 h-12 flex items-center justify-center rounded-full text-2xl border border-emerald-100 shadow-sm">
                📖
              </div>
              <div>
                <h4 className="text-lg font-bold text-black">Jummah Khutbah</h4>
              </div>
            </div>
            <div className="bg-emerald-50 px-5 py-2 rounded-2xl shadow-sm border border-emerald-100 text-center w-full sm:w-auto">
              <span className="block text-[10px] sm:text-xs text-black font-semibold uppercase tracking-widest mb-0.5">Friday</span>
              <span className="block text-xl font-black text-emerald-700">1:30 PM</span>
            </div>
          </div>

          {/* Prayer Card */}
          <div className="bg-white rounded-3xl border border-emerald-100 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between shadow-md text-center md:text-left">
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-4 sm:mb-0">
              <div className="bg-emerald-50 w-12 h-12 flex items-center justify-center rounded-full text-2xl border border-emerald-100 shadow-sm">
                🕌
              </div>
              <div>
                <h4 className="text-lg font-bold text-black">Jummah Prayer</h4>
              </div>
            </div>
            <div className="bg-emerald-50 px-5 py-2 rounded-2xl shadow-sm border border-emerald-100 text-center w-full sm:w-auto">
              <span className="block text-[10px] sm:text-xs text-black font-semibold uppercase tracking-widest mb-0.5">Friday</span>
              <span className="block text-xl font-black text-emerald-700">2:00 PM</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
