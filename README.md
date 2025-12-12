# CGEC Student Management System

A comprehensive student management portal for Cooch Behar Government Engineering College (CGEC).

## Features

- **Admin Portal**: Manage students, teachers, notices, projects, and attendance
- **Teacher Portal**: Mark attendance, manage department notices and projects
- **Student Portal**: View profile, attendance records, and notices
- **Persistent Storage**: All data is saved to browser localStorage and persists across sessions

## Student Login System

When an admin adds a student with a roll number (e.g., `34900124015`), that student can immediately login to the Student Portal using:
- **Username**: Their 11-digit roll number (e.g., `34900124015`)
- **Password**: Any password (students set their own)

### Roll Number Format
\`\`\`
349 + XXX + YY + ZZZ
│     │     │    └── Serial Number (001-999)
│     │     └─────── Admission Year (22, 23, 24, 25)
│     └───────────── Department Code
└─────────────────── College Code (CGEC)
\`\`\`

**Department Codes:**
| Code | Department |
|------|------------|
| 001  | Computer Science & Engineering (CSE) |
| 002  | Electronics & Communication Engineering (ECE) |
| 016  | Electrical Engineering (EE) |
| 004  | Mechanical Engineering (ME) |
| 005  | Civil Engineering (CE) |

## Local Development Setup (VS Code)

### Prerequisites
- Node.js 18.x or later
- npm or yarn
- VS Code (recommended)

### Installation

1. **Download/Extract the project**
   \`\`\`bash
   # Extract ZIP file or clone repository
   cd studentmanagementsystem2
   \`\`\`

2. **Open in VS Code**
   \`\`\`bash
   code .
   \`\`\`

3. **Install dependencies**
   Open terminal in VS Code (Ctrl + `) and run:
   \`\`\`bash
   npm install
   \`\`\`

4. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open in browser**
   \`\`\`
   http://localhost:3000
   \`\`\`

### VS Code Recommended Extensions
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (for better DX)

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on http://localhost:3000 |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Demo Credentials

### Admin Portal
- **Username**: `admin`
- **Password**: `admin123`

### Teacher Portal
- **Username**: `amit.kumar`
- **Password**: `teacher123`

### Student Portal
- **Roll Number**: `34900122001` (or any valid roll number added by admin)
- **Password**: `any` (any password works)

## Data Persistence

This application uses **localStorage** for data persistence:
- All students, teachers, notices, projects, and attendance records are saved locally
- Data persists across browser sessions and page refreshes
- Data is stored per-browser (not shared across devices)
- To reset data, clear browser localStorage or use browser dev tools

## Deploying to Vercel

### Option 1: One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   \`\`\`bash
   npm i -g vercel
   \`\`\`

2. **Login to Vercel**
   \`\`\`bash
   vercel login
   \`\`\`

3. **Deploy**
   \`\`\`bash
   vercel --prod
   \`\`\`

### Option 3: Deploy via GitHub

1. Push your code to a GitHub repository
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Click "Deploy"

### Option 4: Deploy via ZIP Upload

1. Go to [vercel.com/new](https://vercel.com/new)
2. Drag and drop the project folder
3. Click "Deploy"

## Project Structure

\`\`\`
├── app/
│   ├── admin/           # Admin dashboard pages
│   │   ├── students/    # Student management
│   │   ├── teachers/    # Teacher management
│   │   ├── notices/     # Notice management
│   │   ├── projects/    # Project management
│   │   └── attendance/  # Attendance management
│   ├── teacher/         # Teacher dashboard
│   ├── student/         # Student dashboard
│   ├── login/           # Login page and actions
│   ├── api/             # API routes
│   │   ├── auth/        # Authentication endpoints
│   │   ├── students/    # Student CRUD + sync endpoints
│   │   ├── teachers/    # Teacher CRUD + sync endpoints
│   │   ├── notices/     # Notice endpoints
│   │   ├── projects/    # Project endpoints
│   │   └── attendance/  # Attendance endpoints
│   ├── layout.tsx       # Root layout with DataSyncProvider
│   ├── globals.css      # Global styles and design tokens
│   └── page.tsx         # Landing page
├── components/
│   ├── admin/           # Admin-specific components
│   ├── ui/              # shadcn/ui components
│   ├── data-sync-provider.tsx  # Client-server data sync
│   ├── landing-hero.tsx # Hero section with college images
│   └── *.tsx            # Shared components
├── hooks/
│   └── use-persistent-store.ts  # SWR hooks for persistent data
├── lib/
│   ├── auth.ts          # Authentication logic
│   ├── store.ts         # Server-side in-memory store
│   ├── persistent-store.ts  # Client-side localStorage store
│   ├── types.ts         # TypeScript interfaces
│   └── utils.ts         # Utility functions
├── public/
│   └── images/          # Static images (logo, background)
├── next.config.mjs      # Next.js configuration
├── vercel.json          # Vercel deployment config
├── package.json         # Dependencies and scripts
└── README.md            # This file
\`\`\`

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui + Radix UI
- **Data Fetching**: SWR
- **Storage**: localStorage (client-side persistence)
- **Icons**: Lucide React
- **Analytics**: Vercel Analytics

## Troubleshooting

### Data not persisting?
- Make sure you're using the same browser
- Check if localStorage is enabled
- Open DevTools > Application > Local Storage to verify data

### Slow performance?
- Clear browser cache
- Ensure you have the latest Node.js version
- Run `npm run build` and `npm run start` for production mode

### Student can't login?
- Verify the roll number format (11 digits starting with 349)
- Check if the student was added by an admin
- Try any password (password validation is relaxed)

## License

MIT License - Cooch Behar Government Engineering College
