"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Upload, ImageIcon, Clock, Image as LucideImage, Loader2, LogOut, Trash2, Calendar, CheckCircle2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("gallery");
  
  // Gallery States
  const [isUploading, setIsUploading] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [isFetchingGallery, setIsFetchingGallery] = useState(false);

  // Iqama Scheduler States
  const [iqamaSchedules, setIqamaSchedules] = useState([]);
  const [currentIqama, setCurrentIqama] = useState({ id: null, fajr: '06:00', dhuhr: '13:45', asr: '18:30', isha: '21:45' });
  const [isFetchingIqama, setIsFetchingIqama] = useState(false);

  // Check if already logged in during this session
  useEffect(() => {
    const authStatus = sessionStorage.getItem("ilcnb_admin_auth");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch data based on the active tab
  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === "iqama") fetchIqamaSchedules();
      if (activeTab === "gallery") fetchGalleryImages();
    }
  }, [isAuthenticated, activeTab]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem("ilcnb_admin_auth", "true");
      setError("");
    } else {
      setError("Incorrect password");
      setPasswordInput("");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("ilcnb_admin_auth");
  };

  // --- GALLERY LOGIC ---
  const fetchGalleryImages = async () => {
    setIsFetchingGallery(true);
    const { data, error } = await supabase
      .from('gallery_images')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setGalleryImages(data);
    }
    setIsFetchingGallery(false);
  };

  const handleGalleryUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    try {
      const { error: uploadError } = await supabase.storage.from('gallery').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: publicUrlData } = supabase.storage.from('gallery').getPublicUrl(fileName);
      const { error: dbError } = await supabase.from('gallery_images').insert([{ image_url: publicUrlData.publicUrl }]);
      if (dbError) throw dbError;
      
      alert('Image successfully added to the public gallery!');
      fetchGalleryImages(); // Refresh the list instantly after upload
    } catch (error) {
      console.error('Upload failed:', error.message);
      alert('Failed to upload image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteGalleryImage = async (imageUrl) => {
    if (!confirm("Are you sure you want to permanently delete this image?")) return;
    
    try {
      const fileName = imageUrl.split('?')[0].split('/').pop();
      
      const { error: storageError } = await supabase.storage.from('gallery').remove([fileName]);
      if (storageError) console.error("Storage deletion error:", storageError);
      
      const { error: dbError } = await supabase.from('gallery_images').delete().eq('image_url', imageUrl);
      if (dbError) throw dbError;
      
      fetchGalleryImages(); 
    } catch (error) {
      alert("Failed to delete image: " + error.message);
    }
  };


  // --- IQAMA SCHEDULER LOGIC ---
  const fetchIqamaSchedules = async () => {
    setIsFetchingIqama(true);
    const { data, error } = await supabase
      .from('iqama_schedule')
      .select('*')
      .order('effective_date', { ascending: false }); 
      
    if (error) {
      console.error("Error fetching schedules:", error);
      setIsFetchingIqama(false);
      return;
    }
    
    setIqamaSchedules(data);
    
    const today = new Date().toISOString().split('T')[0];
    const active = data.find(s => s.effective_date <= today);
    
    if (active) {
      setCurrentIqama({ id: active.id, fajr: active.fajr, dhuhr: active.dhuhr, asr: active.asr, isha: active.isha });
    }
    setIsFetchingIqama(false);
  };

  const handleUpdateCurrentIqama = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      if (currentIqama.id) {
        await supabase.from('iqama_schedule').update({
          fajr: currentIqama.fajr, dhuhr: currentIqama.dhuhr, asr: currentIqama.asr, isha: currentIqama.isha
        }).eq('id', currentIqama.id);
      } else {
        await supabase.from('iqama_schedule').insert([{
          fajr: currentIqama.fajr, dhuhr: currentIqama.dhuhr, asr: currentIqama.asr, isha: currentIqama.isha, effective_date: today
        }]);
      }
      alert('Current times updated successfully!');
      fetchIqamaSchedules();
    } catch (err) {
      alert('Error updating current times.');
    }
  };

  const handleScheduleFutureIqama = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const scheduleData = {
      fajr: formData.get('fajr'),
      dhuhr: formData.get('dhuhr'),
      asr: formData.get('asr'),
      isha: formData.get('isha'),
      effective_date: formData.get('date'),
    };
    
    try {
      const { error } = await supabase.from('iqama_schedule').insert([scheduleData]);
      if (error) throw error;
      alert('Future schedule saved successfully!');
      e.target.reset();
      fetchIqamaSchedules();
    } catch (err) {
      alert('Error saving schedule: ' + err.message);
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (!confirm("Are you sure you want to delete this scheduled change?")) return;
    try {
      await supabase.from('iqama_schedule').delete().eq('id', id);
      fetchIqamaSchedules();
    } catch (err) {
      alert("Failed to delete schedule.");
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const futureSchedules = iqamaSchedules.filter(s => s.effective_date > todayStr).reverse();


  // --- LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-stone-100 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"><Lock size={32} /></div>
          <h2 className="text-2xl font-bold text-stone-900 mb-2">Admin Portal</h2>
          <p className="text-stone-500 mb-8">Enter the master password to continue.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Password" className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50 cursor-text" />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer">Unlock Dashboard</button>
          </form>
        </motion.div>
      </div>
    );
  }

  // --- ADMIN DASHBOARD ---
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 min-h-screen">
      
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 pb-6 border-b border-stone-200 cursor-default">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-900">Admin Dashboard</h1>
          <p className="text-stone-500 mt-1">Manage website content and settings</p>
        </div>
        <button onClick={handleLogout} className="mt-4 md:mt-0 flex items-center px-4 py-2 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
          <LogOut size={18} className="mr-2" /> Logout
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Menu */}
        <div className="w-full md:w-64 flex flex-col space-y-2">
          <button onClick={() => setActiveTab("gallery")} className={`flex items-center px-4 py-3 rounded-xl font-medium transition-colors cursor-pointer ${activeTab === "gallery" ? "bg-emerald-600 text-white shadow-md" : "text-stone-600 hover:bg-stone-100"}`}>
            <ImageIcon size={20} className="mr-3" /> Gallery
          </button>
          <button onClick={() => setActiveTab("iqama")} className={`flex items-center px-4 py-3 rounded-xl font-medium transition-colors cursor-pointer ${activeTab === "iqama" ? "bg-emerald-600 text-white shadow-md" : "text-stone-600 hover:bg-stone-100"}`}>
            <Clock size={20} className="mr-3" /> Iqama Scheduler
          </button>
          <button onClick={() => setActiveTab("images")} className={`flex items-center px-4 py-3 rounded-xl font-medium transition-colors cursor-pointer ${activeTab === "images" ? "bg-emerald-600 text-white shadow-md" : "text-stone-600 hover:bg-stone-100"}`}>
            <LucideImage size={20} className="mr-3" /> Site Images
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-stone-100">
          
          {/* GALLERY TAB */}
          {activeTab === "gallery" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
              
              {/* Upload Section */}
              <div>
                <h2 className="text-2xl font-bold text-stone-900 mb-6 cursor-default">Gallery Management</h2>
                <div className="bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-default">
                  <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-emerald-600 mb-4"><ImageIcon size={32} /></div>
                  <h3 className="text-lg font-bold text-stone-800 mb-2">Upload to Public Gallery</h3>
                  <p className="text-stone-500 mb-6 max-w-sm">Images uploaded here will automatically appear on the public `/gallery` page. (1GB Storage Limit)</p>
                  <label className={`relative cursor-pointer inline-flex items-center space-x-2 px-8 py-4 rounded-full font-semibold text-white transition-all duration-300 ${isUploading ? 'bg-stone-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 shadow-md hover:-translate-y-0.5'}`}>
                    {isUploading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                    <span>{isUploading ? 'Uploading to database...' : 'Select Image to Upload'}</span>
                    <input type="file" accept="image/*" onChange={handleGalleryUpload} disabled={isUploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" />
                  </label>
                </div>
              </div>

              <hr className="border-stone-100" />

              {/* Manage Existing Images Grid */}
              <div>
                <h3 className="text-xl font-bold text-stone-900 mb-4 cursor-default">Existing Gallery Images</h3>
                
                {isFetchingGallery ? (
                  <div className="flex justify-center py-8"><Loader2 className="animate-spin text-emerald-600" /></div>
                ) : galleryImages.length === 0 ? (
                  <p className="text-stone-500 bg-stone-50 p-6 rounded-xl border border-stone-200 text-center cursor-default">No images in the gallery yet.</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {galleryImages.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-stone-200 group bg-stone-100">
                        <img 
                          src={img.image_url} 
                          alt="Gallery item" 
                          className="w-full h-full object-cover" 
                        />
                        {/* Hover Overlay with Delete Button */}
                        <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                          <button 
                            onClick={() => handleDeleteGalleryImage(img.image_url)}
                            className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full transform hover:scale-110 transition-all cursor-pointer shadow-lg"
                            title="Delete Image"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </motion.div>
          )}

          {/* IQAMA SCHEDULER TAB */}
          {activeTab === "iqama" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
              
              {/* Section 1: Editable Current Times */}
              <div>
                <h2 className="text-2xl font-bold text-stone-900 mb-4 cursor-default">Currently Active Iqama Times</h2>
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
                  <p className="text-sm text-emerald-800 mb-6 cursor-default">These are the times currently showing on the website. Click inside a box to edit a time directly.</p>
                  
                  {isFetchingIqama ? (
                    <div className="flex justify-center py-4"><Loader2 className="animate-spin text-emerald-600" /></div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      {['fajr', 'dhuhr', 'asr', 'isha'].map((prayer) => (
                        <div key={prayer} className="flex flex-col">
                          <label className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1 cursor-default">{prayer}</label>
                          <input 
                            type="time" 
                            value={currentIqama[prayer]} 
                            onChange={(e) => setCurrentIqama({...currentIqama, [prayer]: e.target.value})}
                            className="w-full px-3 py-2 text-lg font-bold rounded-xl border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 bg-white transition-all cursor-pointer hover:bg-stone-50"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <button 
                    onClick={handleUpdateCurrentIqama}
                    className="flex items-center px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors shadow-sm cursor-pointer"
                  >
                    <CheckCircle2 size={18} className="mr-2" /> Save Current Times
                  </button>
                </div>
              </div>

              <hr className="border-stone-100" />

              {/* Section 2: Schedule Future Changes */}
              <div>
                <h2 className="text-2xl font-bold text-stone-900 mb-4 cursor-default">Schedule Future Change</h2>
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6">
                  {/* Added key={JSON.stringify(currentIqama)} so the form completely refreshes with the newest times from the database! */}
                  <form key={JSON.stringify(currentIqama)} onSubmit={handleScheduleFutureIqama} className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-stone-700 mb-2 cursor-default">When should these times take effect?</label>
                      <input type="date" name="date" required min={todayStr} className="w-full md:w-64 px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-200 focus:border-stone-400 bg-white cursor-pointer hover:bg-stone-100" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {['fajr', 'dhuhr', 'asr', 'isha'].map((prayer) => (
                        <div key={prayer}>
                          <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1 cursor-default">{prayer}</label>
                          <input type="time" name={prayer} required defaultValue={currentIqama[prayer]} className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white cursor-pointer hover:bg-stone-100" />
                        </div>
                      ))}
                    </div>
                    
                    <button type="submit" className="flex items-center px-6 py-2.5 bg-stone-800 hover:bg-stone-900 text-white font-semibold rounded-xl transition-colors shadow-sm cursor-pointer">
                      <Calendar size={18} className="mr-2" /> Schedule Change
                    </button>
                  </form>
                </div>
              </div>

              {/* Section 3: Upcoming Schedules List */}
              {futureSchedules.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-stone-900 mb-4 cursor-default">Upcoming Schedules</h2>
                  <div className="space-y-3">
                    {futureSchedules.map((schedule) => (
                      <div key={schedule.id} className="bg-white border border-stone-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm cursor-default">
                        <div className="flex-shrink-0">
                          <span className="inline-block px-3 py-1 bg-stone-100 text-stone-800 text-sm font-bold rounded-lg border border-stone-200">
                            {new Date(schedule.effective_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-sm flex-1 md:justify-center">
                          <span className="font-medium text-stone-600">Fajr: <strong className="text-stone-900">{schedule.fajr}</strong></span>
                          <span className="font-medium text-stone-600">Dhuhr: <strong className="text-stone-900">{schedule.dhuhr}</strong></span>
                          <span className="font-medium text-stone-600">Asr: <strong className="text-stone-900">{schedule.asr}</strong></span>
                          <span className="font-medium text-stone-600">Isha: <strong className="text-stone-900">{schedule.isha}</strong></span>
                        </div>

                        <button 
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          className="flex-shrink-0 text-stone-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 cursor-pointer"
                          title="Delete Scheduled Change"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </motion.div>
          )}

          {/* SITE IMAGES TAB */}
          {activeTab === "images" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-2xl font-bold text-stone-900 mb-6 cursor-default">Manage Site Images</h2>
              <div className="space-y-6">
                
                {[
                  { id: 'home_hero', title: 'Home Page Hero', desc: 'The main background image on the front page.' },
                  { id: 'events_main', title: 'Events Page Image', desc: 'The community gathering photo on the events page.' },
                  { id: 'about_mission', title: 'About Page Image', desc: 'The mission statement photo (currently the Quran).' }
                ].map((imgSection) => (
                  <div key={imgSection.id} className="bg-stone-50 border border-stone-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 cursor-default">
                    <div>
                      <h3 className="text-lg font-bold text-stone-900">{imgSection.title}</h3>
                      <p className="text-sm text-stone-500">{imgSection.desc}</p>
                    </div>
                    <label className="cursor-pointer flex-shrink-0 px-6 py-3 bg-white border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-bold rounded-xl transition-colors shadow-sm flex items-center">
                      <Upload size={18} className="mr-2" />
                      Upload New Image
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden cursor-pointer" 
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          
                          alert("Uploading image... Please wait a moment.");
                          
                          try {
                            const fileExt = file.name.split('.').pop();
                            const fileName = `site_${imgSection.id}_${Math.random()}.${fileExt}`;
                            
                            const { error: uploadError } = await supabase.storage.from('gallery').upload(fileName, file);
                            if (uploadError) throw uploadError;
                            
                            const { data: urlData } = supabase.storage.from('gallery').getPublicUrl(fileName);
                            const { error: dbError } = await supabase.from('site_images').upsert({ 
                              section: imgSection.id, 
                              image_url: urlData.publicUrl 
                            });
                            
                            if (dbError) throw dbError;
                            alert(`${imgSection.title} updated successfully! Refresh the public page to see changes.`);
                          } catch (err) {
                            alert("Upload failed: " + err.message);
                          }
                        }} 
                      />
                    </label>
                  </div>
                ))}

              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}