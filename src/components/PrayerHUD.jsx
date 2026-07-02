"use client";

import React, { useState, useEffect } from "react";

export default function PrayerHUD({ hudState, hudRef, upcomingEvent, headerHeight = 113 }) {
  const [countdownStr, setCountdownStr] = useState("--:--:--");

  // Real-time ticking countdown engine
  useEffect(() => {
    if (!upcomingEvent) return;

    const tick = () => {
      const now = Date.now();
      const diff = upcomingEvent.targetTime - now;

      if (diff <= 0) {
        setCountdownStr("00:00:00");
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      const format = (n) => n.toString().padStart(2, "0");
      setCountdownStr(`${format(hours)}:${format(minutes)}:${format(seconds)}`);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [upcomingEvent]);

  // Determine classes based on scroll state
  let positionClasses = "";
  let dynamicStyles = {};

  if (hudState === "floating-footer") {
    positionClasses = "fixed bottom-6 left-0 right-0 mx-auto w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)] lg:w-[calc(100%-4rem)] max-w-[960px] z-40 rounded-3xl bg-white/95 border border-emerald-200 shadow-xl backdrop-blur-md text-emerald-800";
  } else if (hudState === "sticky-header") {
    positionClasses = "fixed left-0 right-0 mx-auto w-full max-w-none z-40 rounded-none bg-white/95 backdrop-blur-md shadow-md text-emerald-800 border-b border-emerald-200";
    dynamicStyles = { top: `${headerHeight}px` };
  } else {
    // Docked - anchored to the exact bottom of the wrapper
    positionClasses = "absolute -bottom-[1px] left-0 right-0 mx-auto w-full max-w-none z-30 rounded-t-3xl rounded-b-none bg-white/95 backdrop-blur-md text-emerald-800 border border-emerald-200 border-b-0 shadow-none bg-clip-padding";
  }

  const scrollToMatrix = () => {
    const matrix = document.getElementById("daily-prayer-matrix");
    if (matrix && hudRef.current) {
      const rect = matrix.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset;
      // Scroll to exactly where the docked HUD sits beneath the sticky header
      const targetY = rect.top + scrollY - headerHeight - hudRef.current.offsetHeight;
      window.scrollTo({ top: targetY, behavior: "smooth" });
    }
  };

  if (!upcomingEvent) return null;

  return (
    <div 
      ref={hudRef}
      onClick={scrollToMatrix}
      className={`${positionClasses} overflow-hidden font-sans cursor-pointer group`}
      style={{
        ...dynamicStyles,
        transitionProperty: "width, border-radius, background-color, border-color, box-shadow",
        transitionDuration: "500ms",
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        willChange: "width, border-radius"
      }}
    >
      <div className="mx-auto max-w-7xl px-5 py-4 md:py-4 md:px-6 flex flex-row items-center justify-between gap-3 md:gap-4 transition-transform active:scale-[0.99]">
        {/* Next Prayer Info */}
        <div className="flex items-center gap-2 md:gap-4">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <div className="flex flex-col">
            <span className="hidden md:block text-[10px] uppercase tracking-wider text-black font-semibold">Upcoming Prayer</span>
            <span className="text-[10px] md:hidden uppercase tracking-wider text-black font-semibold">Next</span>
            <span className="text-base md:text-xl font-serif font-bold text-emerald-700 leading-none">{upcomingEvent.name}</span>
          </div>
        </div>

        {/* Timings */}
        <div className="flex items-center gap-4 md:gap-8 text-center md:text-left">
          <div className="hidden md:flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-black font-semibold">Adhan</span>
            <span className="text-sm md:text-base font-bold font-mono text-emerald-600 leading-none md:leading-normal mt-0.5 md:mt-0">{upcomingEvent.adhan}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-black font-semibold">Iqamah</span>
            <span className="text-sm md:text-base font-bold font-mono text-emerald-600 leading-none md:leading-normal mt-0.5 md:mt-0">{upcomingEvent.iqamah}</span>
          </div>
        </div>

        {/* Countdown */}
        <div className="flex flex-col items-end">
          <span className="md:block text-[10px] uppercase tracking-wider text-black font-semibold">
            {upcomingEvent.type === 'iqamah' ? 'Time to Iqamah' : 'Time to Adhan'}
          </span>
          <span className="text-sm md:text-base font-mono font-bold text-emerald-600 leading-none md:leading-normal mt-0.5 md:mt-0">{countdownStr}</span>
        </div>
      </div>
    </div>
  );
}
