<div align="center">
<img width="1200" height="475" alt="Pulse Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Pulse — Social Media Mini Platform

> A full-stack social media platform built with React and Firebase, enabling users to create profiles, share posts, and engage through likes, comments, and interactions.

---

## 📋 Project Overview

**Pulse** is a modern social media web application that allows users to:

- **Create & Manage Profiles** — Custom usernames, display names, bios, and profile photos
- **Share Content** — Photo and video posts with captions, locations, and hashtags
- **Engage** — Like and comment on posts from other users
- **Connect** — Follow/unfollow users and discover new content
- **Stay Updated** — Real-time notifications for likes, comments, and new followers

### Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React 19, TypeScript |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS 4 |
| Backend | Firebase (Auth, Firestore) |
| Routing | React Router 7 |
| Animations | Motion |
| Icons | Lucide React |

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- Firebase project with:
  - Authentication enabled (Google & Anonymous providers)
  - Firestore database
  - Authorized domains configured

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Pulse

# Install dependencies
npm install
```

### Configuration

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** (Google & Anonymous sign-in providers)
3. Add your domain to **Authorized domains** in Firebase Console
4. Update `firebase-applet-config.json` with your Firebase config:

```json
{
  "projectId": "your-project-id",
  "appId": "your-app-id",
  "apiKey": "your-api-key",
  "authDomain": "your-project.firebaseapp.com",
  "firestoreDatabaseId": "(default)",
  "storageBucket": "your-project.firebasestorage.app",
  "messagingSenderId": "your-sender-id",
  "measurementId": "your-measurement-id"
}
```

### Run Locally

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

---

## 📱 Features

| Feature | Description |
|---------|-------------|
| **Authentication** | Google OAuth & Guest login with profile setup |
| **Profile Management** | Edit display name, bio, profile photo |
| **Feed** | Real-time home feed with stories |
| **Posts** | Create photo/video posts with captions |
| **Interactions** | Like and comment on posts |
| **Stories** | 24-hour disappearing content |
| **Reels** | Full-screen video feed |
| **Messages** | Direct messaging between users |
| **Notifications** | Activity feed for likes, comments, follows |
| **Search** | Find and discover other users |
| **Moderation** | Basic content moderation tools |

---

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components
├── pages/           # Route pages
│   ├── Home.tsx         # Main feed
│   ├── Profile.tsx      # User profiles
│   ├── Upload.tsx       # Create posts
│   ├── Messages.tsx     # Direct messages
│   ├── Notifications.tsx
│   └── ...
├── firebase.ts      # Firebase configuration
├── types.ts        # TypeScript definitions
└── App.tsx         # Main app with routing
```

---

## 🔧 Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Start development server |
| `build` | `npm run build` | Production build |
| `preview` | `npm run preview` | Preview production build |
| `lint` | `npm run lint` | TypeScript type checking |

---

## 📄 License

MIT License — feel free to use and modify for your own projects.

---

<div align="center">
Built with ❤️ using React + Firebase
</div>