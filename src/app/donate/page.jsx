import React from 'react';
import { Clock, MapPin, Users, Heart, DollarSign, HeartHandshake } from 'lucide-react';

export const metadata = {
  title: 'Donate - ILCNB',
  description: 'Support the Islamic Learning Center of North Broward. Your donations help us maintain the mosque, host events, and plan for future expansion.',
};

export default function DonatePage() {
  const fundsGo = [
    { title: "Facility Operations", desc: "Rent, utilities, and maintenance to keep the mosque open and clean.", icon: Clock },
    { title: "Future Expansion", desc: "Savings for a permanent location to serve the four major cities.", icon: MapPin },
    { title: "Community Events", desc: "Funding for Iftars, youth activities, and educational halaqas.", icon: Users }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-3xl md:text-4xl font-extrabold text-stone-900 mb-8 tracking-tight flex flex-col sm:flex-row items-center justify-center gap-3">
          Support Your Mosque <Heart className="text-rose-500 fill-rose-500" size={32} />
        </h1>
        <blockquote className="bg-emerald-50/50 p-6 sm:p-8 rounded-3xl border border-emerald-100 italic text-stone-700 text-base sm:text-lg shadow-sm">
          <p className="mb-4">“You shall never attain the (perfect standard) of righteousness until you spend (in charity) from (the wealth) that you love; and whatever you spend, Allāh surely knows it.”</p>
          <footer className="font-bold text-black not-italic">— Quran 3:92</footer>
        </blockquote>
      </div>

      {/* Donation Methods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
        {/* PayPal Link */}
        <a 
          href="https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=contact@ilcnb.org&lc=US&no_note=0&item_name=Donation/Charity&cn=&curency_code=USD&bn=PP-DonationsBF:btn_donateCC_LG.gif:NonHosted"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-sky-100 border border-sky-200 text-sky-950 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center shadow-lg hover:-translate-y-2 transition-transform cursor-pointer block group min-h-[280px]"
        >
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 text-sky-600 group-hover:scale-110 transition-transform duration-300 shadow-sm">
            <DollarSign size={40} strokeWidth={3} />
          </div>
          <h3 className="text-3xl font-bold mb-3">PayPal</h3>
          <p className="text-sky-800 font-medium text-lg">Click here to donate</p>
        </a>

        {/* Zelle */}
        <div className="bg-emerald-100 border border-emerald-200 text-emerald-950 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center shadow-lg hover:-translate-y-1 transition-transform cursor-pointer min-h-[280px] group">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 text-emerald-600 font-bold text-4xl shadow-sm group-hover:scale-110 transition-transform duration-300">
            Z
          </div>
          <h3 className="text-3xl font-bold mb-3">Zelle</h3>
          <p className="text-emerald-800 font-medium text-lg">contact@ilcnb.org</p>
        </div>

        {/* In Person */}
        <div className="bg-stone-200 border border-stone-300 text-stone-900 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center shadow-lg hover:-translate-y-1 transition-transform min-h-[280px] group">
          <div className="w-20 h-20 bg-white/80 rounded-full flex items-center justify-center mb-6 text-stone-700 shadow-sm group-hover:scale-110 transition-transform duration-300">
            <HeartHandshake size={40} />
          </div>
          <h3 className="text-3xl font-bold mb-3">In Person</h3>
          <p className="text-stone-700 font-medium text-lg">Cash donations accepted</p>
        </div>
      </div>

      {/* Where funds go */}
      <div>
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">Where do your funds go?</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {fundsGo.map((item, idx) => (
            <div key={idx} className="bg-white border border-stone-100 rounded-3xl p-8 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform">
                <item.icon size={120} />
              </div>
              <div className="bg-emerald-100 w-14 h-14 rounded-2xl flex items-center justify-center text-emerald-700 mb-6 relative z-10">
                <item.icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-3 relative z-10">{item.title}</h3>
              <p className="text-stone-600 leading-relaxed relative z-10">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
