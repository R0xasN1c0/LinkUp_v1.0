
# LINK-UP APP
LINK-UP is a full-featured mobile app for scheduling events and synchronizing availability among groups. Users can sync their calendars, propose events, and vote on the best time.

## Contributors
- **Sultan Alsheddy**: Backend developer, Database setup
- **Nicolas Roxas**: Project Leader, Backend developer, Bug fixer
- **Piotr Krawiec**: Database integration, Bug reports
- **Aiden Armand**: Frontend developer, App tester
- **Loewi Ibrahim**: UI integration, App tester

## User Guide
### 1.  Installation (APK)
Get the latest APK file.

On Android:
- Open File Manager → Tap the APK.
- Enable "Install from Unknown Sources" if prompted.
- Tap Install, then Open.

### 2.  Features Walkthrough
**Sign Up / Sign In**: Email-based registration and login.

**Dashboard:**
- Today's Events
- Upcoming Events
- Groups
- Active Votes

**+ Add Event**: Add event title, time, and optional location.

**Connect Calendar**: Tap calendar icon → Google Auth → Sync your external calendar. (for future update, still in dev)

**Groups**: Create, view, and manage groups with shared availability.

**Friends**: Search by username and send friend requests.

**Vote on Times**: View active polls and cast your vote.

**Profile**: Update display name and avatar.

## Technology Stack
### Tech Used 
| Type | Tech |
|------|------|
| Frontend | React, TypeScript, Tailwind, shadcn-ui |
| Backend | Supabase (PostgreSQL + Auth + Functions) |
| Mobile | Shell Capacitor (Android/iOS build) |
| Calendar | Google Calendar API (OAuth & sync) |

### Requirements:
| Tool | Notes |
|------|-------|
| Node.js | Install with nvm |
| Android Studio | SDK 21+ and emulator |
| Capacitor CLI | Native wrapper for mobile builds |

## Setup Guide (Dev & Prod)
### 1.  Clone and Install
```
git clone <your_git_repo>
cd LinkUp
npm install
```

### 2.  Run Web Dev Server
```
npm run dev
```

### 3.  Mobile Build & Run (Capacitor)
```
npm run build
npx cap sync
```

**Android:**
```
npx cap open android
```
Then run from Android Studio

## 🗳️ Building the APK (Release)
**Generate Keystore:**
```
keytool -genkey -v -keystore release-key.keystore -alias key0 -keyalg RSA -keysize 2048 -validity 10000
```
Update Keystore in capacitor.config.ts

**Build:**
```
npm run build
npx cap sync android
npx cap open android
```

In Android Studio:
- Build > Generate Signed Bundle
- Select release-key.keystore & passwords
- Export .apk

## Packages & APIs

**Supabase**
- Usage: Auth, DB, Storage
- Why: Fast, scalable PostgreSQL backend with built-in auth
- Endpoints:
  - supabase.auth.signUp({ email, password })
  - supabase.from('events').insert([...])
- Auth: JWT-based using Supabase client SDK

**Capacitor**
- Usage: Native Android wrapper
- Why: Build native APKs with web code

**Tailwind CSS**
- Usage: Fast, responsive styling
- Why: Utility-first and highly customizable
