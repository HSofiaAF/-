# Recuerdos Familiares — Project Identity & Context

## Project Overview
Interactive family memories web application ("Recuerdos Familiares") allowing family members to share, browse, and preserve photos and videos with real-time comments, likes/favorites, background music player, slideshow mode, and online presence tracking.

## Tech Stack
- **Framework & Core**: React 19 (JSX), Vite 8, JavaScript (ES modules)
- **Styling**: Tailwind CSS v4 (@tailwindcss/vite)
- **Backend & Database**: Firebase 12 (Authentication, Cloud Firestore, Cloud Storage)
- **State & Utilities**: React Context API (`AuthContext`), `lucide-react`, `browser-image-compression`, `canvas-confetti`
- **Linting & Quality**: Oxlint
- **Deployment**: GitHub Pages (`gh-pages`) & Firebase Hosting

## Project Structure
```
/--main
  /src
    /components/       → UI Modals & Views (Navbar, MemoryCard, TimelineView, MemoryModal, UploadModal, SlideshowModal, etc.)
    /context/          → AuthContext (Firebase auth state, roles: isOwner, canUpload, fallback mode)
    /data/             → Initial mock/fallback memories (initialMemories.js)
    /firebase/         → Firebase initialization (config.js) & services/CRUD operations (services.js)
    /utils/            → Family member metadata and helper utilities (people.js)
    App.jsx            → Main application container, filters, view modes (grid/timeline), and modal state
    index.css          → Tailwind CSS directives and custom animations
    main.jsx           → React DOM root entry point
  /public/             → Public static assets, icons, audio, and media
  firestore.rules      → Cloud Firestore security rules
  storage.rules        → Cloud Storage security rules
  vite.config.js       → Vite build configuration
```

## Key File References (Read only when needed)
- **Firebase Services & CRUD**: `/src/firebase/services.js`
- **Auth & Permissions**: `/src/context/AuthContext.jsx`
- **Main View & State**: `/src/App.jsx`
- **Upload Flow**: `/src/components/UploadModal.jsx`
- **Detail & Comments**: `/src/components/MemoryModal.jsx`
- **Timeline View**: `/src/components/TimelineView.jsx`
- **Security Rules**: `/firestore.rules` & `/storage.rules`

## Core Domain Concepts & Conventions
- **Memory**: An entity containing `title`, `description`, `date`, `category`, `imageUrl` (or `mediaUrl`), `author`, `likes` (array of user IDs), and `comments` (array of `{id, text, author, createdAt}`).
- **Roles**: Owner (`isOwner`), approved uploader (`canUpload`), viewer.
- **Components**: PascalCase functional components with named exports.
- **Styling**: Tailwind CSS utility classes; avoid inline styles.
- **Verification**: Run `npm run build` or `npx oxlint` to verify zero errors before completing tasks.
