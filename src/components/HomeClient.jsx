"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import PrayerHUD from './PrayerHUD'; 

// Initialize Supabase (Safe for browser using Anon key)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function HomeClient({ initialBgImage }) {
  const [structuredPrayers, setStructuredPrayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTomorrow, setIsTomorrow] = useState(false); // Tracks if we should show tomorrow's times
  
  const [bgImage, setBgImage] = useState(initialBgImage);
  
  const [hudState, setHudState] = useState("floating-footer");
  const [upcomingEvent, setUpcomingEvent] = useState(null);
  const [headerHeight, setHeaderHeight] = useState(113);
  const hudRef = useRef(null);
  const wrapperRef = useRef(null);
  const tableRef = useRef(null);
  
  const [rawDbData, setRawDbData] = useState(null); // Stores DB results to avoid re-fetching

  const format12H = (time24) => {
    if (!time24) return '--:--';
    let [h, m] = time24.split(':').map(Number);
    let date = new Date();
    date.setHours(h, m, 0);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const getTimestamp = (time24, addDays = 0) => {
    if (!time24) return null;
    const now = new Date();
    const [h, m] = time24.split(':').map(Number);
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
    if (addDays !== 0) d.setDate(d.getDate() + addDays);
    return d.getTime();
  };

  const buildPrayers = (dayData, iqamaData) => {
    return [
      { name: 'Fajr', adhanTime24: dayData.fajr_adhan, iqamahTime24: iqamaData.fajr, adhan: format12H(dayData.fajr_adhan), iqamah: format12H(iqamaData.fajr) },
      { name: 'Dhuhr', adhanTime24: dayData.dhuhr_adhan, iqamahTime24: iqamaData.dhuhr, adhan: format12H(dayData.dhuhr_adhan), iqamah: format12H(iqamaData.dhuhr) },
      { name: 'Asr', adhanTime24: dayData.asr_adhan, iqamahTime24: iqamaData.asr, adhan: format12H(dayData.asr_adhan), iqamah: format12H(iqamaData.asr) },
      { name: 'Maghrib', adhanTime24: dayData.maghrib_adhan, iqamahTime24: dayData.maghrib_adhan, adhan: format12H(dayData.maghrib_adhan), iqamah: format12H(dayData.maghrib_adhan) },
      { name: 'Isha', adhanTime24: dayData.isha_adhan, iqamahTime24: iqamaData.isha, adhan: format12H(dayData.isha_adhan), iqamah: format12H(iqamaData.isha) },
    ];
  };

  // 1. Fetch raw data from Supabase once on mount
  useEffect(() => {
    const fetchPrayersFromDB = async () => {
      try {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const todayStr = today.toLocaleDateString('en-CA'); 
        const tomorrowStr = tomorrow.toLocaleDateString('en-CA');

        const { data: adhanData, error: adhanError } = await supabase
          .from('prayer_times')
          .select('*')
          .in('date', [todayStr, tomorrowStr])
          .order('date', { ascending: true });

        if (adhanError) throw adhanError;

        const { data: iqamaData, error: iqamaError } = await supabase
          .from('iqama_schedule')
          .select('*')
          .lte('effective_date', todayStr)
          .order('effective_date', { ascending: false })
          .limit(1);

        if (iqamaError) throw iqamaError;

        if (adhanData && adhanData.length > 0) {
          const todayData = adhanData.find(row => row.date === todayStr) || adhanData[0];
          const tomorrowData = adhanData.find(row => row.date === tomorrowStr) || adhanData[0];
          
          const activeIqama = iqamaData && iqamaData.length > 0 
            ? iqamaData[0] 
            : { fajr: '06:00', dhuhr: '13:45', asr: '18:30', isha: '21:45' };

          setRawDbData({ todayData, tomorrowData, activeIqama });
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch prayer times from Supabase:", error);
        setLoading(false);
      }
    };

    fetchPrayersFromDB();
  }, []);

  // 2. Continuous Engine: Calculate times every second based on the raw DB data
  useEffect(() => {
    if (loading || !rawDbData) return;

    const updatePrayerState = () => {
      const { todayData, tomorrowData, activeIqama } = rawDbData;
      const nowMs = new Date().getTime();

      // Check if Isha Iqamah has passed
      const todayPrayers = buildPrayers(todayData, activeIqama);
      const ishaIqamahTs = getTimestamp(todayPrayers[4].iqamahTime24);
      
      const isAfterIsha = nowMs >= ishaIqamahTs;
      setIsTomorrow(isAfterIsha);

      // If after Isha, use tomorrow's schedule for the table. Otherwise, use today's.
      const displayPrayers = isAfterIsha ? buildPrayers(tomorrowData, activeIqama) : todayPrayers;
      setStructuredPrayers(displayPrayers);

      // Find the NEXT event (Adhan or Iqamah)
      let nextEvt = null;
      for (let i = 0; i < displayPrayers.length; i++) {
        const p = displayPrayers[i];
        
        // If we are showing tomorrow's prayers, we must add +1 day to the timestamp logic
        const adhanTs = getTimestamp(p.adhanTime24, isAfterIsha ? 1 : 0);
        const iqamahTs = getTimestamp(p.iqamahTime24, isAfterIsha ? 1 : 0);

        if (nowMs < adhanTs) {
          nextEvt = { ...p, type: 'adhan', targetTime: adhanTs };
          break;
        } else if (nowMs < iqamahTs) {
          nextEvt = { ...p, type: 'iqamah', targetTime: iqamahTs };
          break;
        }
      }

      // Fallback just in case
      if (!nextEvt) {
        nextEvt = { ...displayPrayers[0], type: 'adhan', targetTime: getTimestamp(displayPrayers[0].adhanTime24, isAfterIsha ? 2 : 1) };
      }
      
      setUpcomingEvent(nextEvt);
    };

    updatePrayerState(); // Run immediately
    const interval = setInterval(updatePrayerState, 1000); // Check every second
    
    return () => clearInterval(interval);
  }, [loading, rawDbData]);

  // Scrolling logic for the HUD
  useEffect(() => {
    if (loading) return;
    const handleScroll = () => {
      const tableElement = tableRef.current;
      if (!tableElement) return;

      const tableRect = tableElement.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const scrollY = window.scrollY;
      const tableAbsoluteTop = tableRect.top + scrollY;

      const hudHeight = hudRef.current ? hudRef.current.offsetHeight : (window.innerWidth >= 640 ? 69 : 58);
      const headerEl = document.querySelector('header');
      const currentHeaderHeight = headerEl ? headerEl.offsetHeight : (window.innerWidth >= 640 ? 113 : 72);
      
      setHeaderHeight(currentHeaderHeight);

      if (wrapperRef.current) {
        wrapperRef.current.style.height = `${hudHeight}px`;
      }

      let newState = "floating-footer";
      const bottomOffset = 24; 
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
      <div className="w-full relative min-h-[calc(100vh-5rem)] flex flex-col items-center justify-start pt-28 md:justify-center md:pt-0 pb-32 px-4 overflow-hidden bg-white">
        
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={bgImage ? { backgroundImage: `url('${bgImage}')` } : {}}
        />
        <div className="absolute bottom-0 left-0 right-0 h-1/10 z-0 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        
        <div className="relative z-10 w-full max-w-4xl flex flex-col items-center md:mt-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center w-full flex flex-col items-center"
          >
           <h2 className="text-base sm:text-lg md:text-[32px] md:leading-tight font-semibold text-black italic px-6 py-3 mb-6 sm:mb-8 rounded-2xl bg-white/10 backdrop-blur-[2px] shadow-[0_0_20px_10px_rgba(255,255,255,0.1)]">
           May the peace, mercy and blessings of Allah (God) be upon you
            </h2>
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-black leading-tight px-8 py-5 rounded-3xl bg-white/10 backdrop-blur-[2px] shadow-[0_0_30px_15px_rgba(255,255,255,0.1)]">
              السلام عليكم ورحمة الله وبركاته
            </h1>
          </motion.div>
        </div>
      </div>

      <div className="w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)] lg:w-[calc(100%-4rem)] max-w-[960px] mx-auto mt-12 sm:mt-16 z-20 relative" ref={tableRef}>
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
          <div className="bg-emerald-50 px-4 sm:px-6 py-5 sm:py-6 text-center border-b border-emerald-100">
            {/* Dynamic Header based on time of day */}
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-black">
              {isTomorrow ? "Tomorrow's Prayer Times" : "Today's Prayer Times"}
            </h3>
            <p className="text-emerald-800 text-xs sm:text-sm mt-1 opacity-90">Coconut Creek, FL • University of Islamic Sciences, Karachi Hanafi Method</p>
          </div>
          
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
                    {structuredPrayers.map((prayer) => {
                      const isNext = upcomingEvent?.name === prayer.name;

                      return (
                        <tr 
                          key={prayer.name} 
                          className={`border-b border-emerald-100/50 transition-colors bg-white hover:bg-emerald-50 ${
                            isNext ? 'bg-emerald-50/80 border-l-4 border-l-emerald-500' : ''
                          }`}
                        >
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <div className="flex items-center font-bold text-base sm:text-lg">
                              <span>{prayer.name}</span>
                              {isNext && <span className="ml-2 sm:ml-3 text-[8px] sm:text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white px-2 py-0.5 sm:py-1 rounded-full shadow-sm">Next</span>}
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 font-medium text-sm sm:text-base text-stone-700 whitespace-nowrap">
                            {prayer.adhan}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 font-bold text-sm sm:text-base text-emerald-700 whitespace-nowrap">
                            {prayer.iqamah}
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
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-4 sm:mt-6 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="bg-white rounded-3xl border border-emerald-100 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between shadow-md text-center md:text-left cursor-default">
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-4 sm:mb-0">
              <div className="bg-emerald-50 w-12 h-12 flex items-center justify-center rounded-full text-2xl border border-emerald-100 shadow-sm">📖</div>
              <div><h4 className="text-lg font-bold text-black">Jummah Khutbah</h4></div>
            </div>
            <div className="bg-emerald-50 px-5 py-2 rounded-2xl shadow-sm border border-emerald-100 text-center w-full sm:w-auto">
              <span className="block text-[10px] sm:text-xs text-black font-semibold uppercase tracking-widest mb-0.5">Friday</span>
              <span className="block text-xl font-black text-emerald-700">1:45 PM</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-emerald-100 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between shadow-md text-center md:text-left cursor-default">
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-4 sm:mb-0">
              <div className="bg-emerald-50 w-12 h-12 flex items-center justify-center rounded-full text-2xl border border-emerald-100 shadow-sm">🕌</div>
              <div><h4 className="text-lg font-bold text-black">Jummah Prayer</h4></div>
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