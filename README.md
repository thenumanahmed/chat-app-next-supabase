# Real-Time Chat Application

A modern, fast, and responsive real-time chat application built with Next.js, Supabase, and Tailwind CSS.

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-4A3E3D?style=for-the-badge&logo=zustand&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

## ✨ Features

- **Real-time Messaging**: Instant message delivery and synchronization across all clients using Supabase Realtime subscriptions.
- **Secure Authentication**: Robust user authentication flow backed by Supabase Auth.
- **Optimistic UI Updates**: Snappy and uninterrupted user experience with optimistic message adding, editing, and deleting using Zustand.
- **Responsive Design**: A beautiful, mobile-friendly interface built from the ground up with Tailwind CSS.
- **Infinite Scrolling**: Smoothly load message history on demand with offset-based pagination.
- **Message Management**: Users can edit and delete their own messages in real-time.

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router)
- **Database & Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Language**: TypeScript

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com/) project

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/thenumanahmed/chat-app-next-supabase.git
   cd chat-app-next-supabase
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Apply database migrations (Supabase CLI):**

   This repo keeps Supabase migrations in `supabase/migrations/`. The Supabase CLI is included as a dev dependency, so you can run it via `npx`.

   **Apply migrations to your hosted Supabase project (recommended):**
   ```bash
   npx supabase login
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   ```
   Note: `supabase link` will prompt for your database password (Supabase dashboard → **Project Settings** → **Database**).

   **Apply migrations to a local Supabase instance (optional, requires Docker):**
   ```bash
   npx supabase start
   npx supabase db reset
   ```
   Note: `db reset` recreates the local database (it will wipe local data).

5. **Run the development server:**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app in action.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/thenumanahmed/chat-app-next-supabase/issues).

## 📝 License

This project is licensed under the MIT License.
