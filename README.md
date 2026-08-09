# ILCNB End-to-End Site

**Live Site:** [ilcnb.org](https://ilcnb.org)

A full-stack, responsive web application built with Next.js serving a user base of **300+ community members**. The platform manages and displays real-time daily schedules, community image galleries, and dynamic site content. It features an automated ETL data pipeline, a complex time-calculation engine, a scroll-aware Heads-Up Display (HUD), and a highly secure, custom-built Admin Dashboard.

## 🚀 Tech Stack

* **Frontend Framework:** Next.js (App Router), React
* **Styling & Animation:** Tailwind CSS, Framer Motion
* **Icons:** Lucide React
* **Backend & Database:** Supabase (PostgreSQL)
* **Automation & CI/CD:** GitHub Actions, Python
* **File Storage:** Supabase Storage buckets
* **Authentication:** Next.js Server Actions (Custom single-password auth flow)
* **Deployment:** Vercel

---

## 🧠 Core Technical Features

### 1. Automated ETL Data Pipeline (GitHub Actions)
To ensure the database is always populated with the most accurate, up-to-date schedule information without manual intervention, the platform utilizes an automated Extract, Transform, Load (ETL) architecture.
* **Extraction & Transformation:** A Python script fetches raw timing data from external APIs, cleans the response, and standardizes the time formats to strict 24-hour database constraints.
* **Automated Loading:** The script is executed on a strict CRON schedule via **GitHub Actions**, securely pushing the transformed data directly into the Supabase PostgreSQL database using encrypted service-role environment variables.
* **Frontend Optimization:** By handling data fetching on the backend via the ETL pipeline, the Next.js frontend is completely protected from external API rate-limiting and client-side fetching delays.

### 2. Real-Time Time Calculation Engine
The application processes daily scheduled events using a continuous interval engine directly in the browser.
* **Complex Time Math:** Automatically parses 24-hour database strings, converts them to local device time, and calculates the exact millisecond difference for the countdown timer.
* **Midnight Rollover:** Intelligently detects when the final event of the day has passed, automatically fetching and displaying the next day's schedule to prevent null states or UI crashes.
* **Day-Specific Interception:** Utilizes `useMemo` to intercept specific days of the week to dynamically alter the schedule and inject recurring weekly events into the HUD.

### 3. Scroll-Aware Dynamic HUD
The Heads-Up Display features a responsive state machine that reacts to window scroll events.
* Smoothly transitions between three layout states: `floating-footer`, `docked`, and `sticky-header`.
* Uses `getBoundingClientRect` to calculate precise pixel distances between the viewport, the table wrapper, and the header.
* Animations and layout shifts are hardware-accelerated using Framer Motion and native CSS transitions.

### 4. Future-Dated Content Scheduling
Instead of requiring manual updates on the day of a schedule change, the Admin panel allows administrators to input future schedules tied to an `effective_date`. The frontend database query uses `.lte('effective_date', todayStr)` combined with `.order().limit(1)` to automatically roll over to new schedules precisely at midnight on the target date.

### 5. Media & Asset Management
* Full CRUD functionality for a public image gallery.
* Images are uploaded directly from the browser to Supabase Storage buckets.
* Database rows containing the public URLs are automatically synchronized with the storage bucket.
* Features dynamic site-image replacement for specific layout sections (Hero, About, Events) using `.upsert()`.

---

## 🔐 Security Architecture

Standard email/password authentication was bypassed in favor of a customized, high-security single-password flow designed specifically for simple administrative handoffs.

* **Zero Client-Side Secrets:** The authentication logic is strictly contained within a Next.js Server Action (`"use server"`).
* **Service Role Bypassing:** The server action utilizes the Supabase `SERVICE_ROLE_KEY` to verify the password against an `admin_settings` table. 
* **Row Level Security (RLS):** The `admin_settings` table is locked down via strict RLS policies, making the master password completely invisible to the public API and Anon keys.
* **Session Storage:** Upon a successful server-side check, a temporary session token is passed to the client to keep the dashboard unlocked during the active browser session.

---

## 💻 Local Setup & Installation

**1. Clone the repository:**
```bash
git clone [https://github.com/yourusername/your-repo-name.git](https://github.com/yourusername/your-repo-name.git)
cd your-repo-name
```

**2. Install dependencies:**
```bash
npm install
```

**3. Set up environment variables:**
Create a `.env.local` file in the root directory and add the following keys. 

```text
# Public keys for client-side database fetching
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Private key STRICTLY for Server Actions (Do not prefix with NEXT_PUBLIC)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**4. Run the development server:**
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

---

## 🗄️ Database Schema Overview

The Supabase PostgreSQL database consists of the following primary tables:

* `prayer_times`: Populated automatically by the GitHub Actions ETL pipeline with raw daily scheduling data.
* `iqama_schedule`: Stores admin-defined schedule blocks with an `effective_date`.
* `gallery_images`: Maps `image_url` strings to files in the Supabase storage bucket.
* `site_images`: Uses a `section` column as a unique identifier to allow `.upsert()` updates for global site assets.
* `admin_settings`: A highly restricted key-value pair table holding the master admin password for server-side verification.
