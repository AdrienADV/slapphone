<p align="center">
  <img src="./assets/icon-only.png" alt="Slap Phone icon" width="112" height="112" />
</p>

# Slap Phone

Slap Phone is a React + Capacitor mobile app that turns phone movement into sound effects. The main mode plays a selected sound when the phone is slapped, and the anti-theft mode triggers a siren when the armed device is moved.

## Features

- Motion detection through the accelerometer with `@capgo/capacitor-accelerometer`.
- `Slap` mode: slap the phone to play the selected sound.
- 9 bundled sounds: Fart, Combo, Gentleman, Goat, Groan, Metal, Dude, Sexy, and Yamete.
- Sensitivity levels: `Soft`, `Medium`, and `Hard`.
- Preloaded audio for lower playback latency.
- `Thief` mode: arm the phone with a countdown, then play a siren if it moves.
- Native tab navigation with `@capgo/capacitor-native-navigation`.
- Mobile transitions with `@capgo/capacitor-transitions`.
- iOS and Android support through Capacitor.
- Native update flow configured with `@capgo/capacitor-updater`.

## Tech Stack

- React 19
- Vite 8
- TypeScript 5.9
- Capacitor 8
- Tailwind CSS 4
- shadcn/ui
- Motion
- Capgo plugins

## Requirements

- Node.js 20+
- npm
- Xcode for iOS development
- Android Studio and Android SDK for Android development

## Installation

```bash
npm install
```

## Web Development

```bash
npm run dev
```

The app runs in the browser through Vite. Some features rely on Capacitor plugins and are most useful on a real mobile device.

## Mobile Development With Live Reload

```bash
npm run dev:mobile
```

This script starts Vite on the local network, computes `CAP_SERVER_URL`, and lets the iOS and Android projects load the app from the development server.

Then open the native project:

```bash
npx cap open ios
npx cap open android
```

## Build And Native Sync

```bash
npm run build
npx cap sync
```

Or use the existing script:

```bash
npm run sync
```

`npm run sync` builds the web assets into `dist/`, then syncs Capacitor with the `ios/` and `android/` projects.

## Available Scripts

- `npm run dev`: start Vite.
- `npm run dev:mobile`: start Vite for Capacitor live reload on a real device.
- `npm run build`: compile the web app into `dist/`.
- `npm run sync`: run the build and then `npx cap sync`.
- `npm run preview`: preview the production build.
- `npm run lint`: run ESLint.

## Project Structure

```text
slapphone/
├── assets/
│   ├── icon-only.png        # App icon
│   ├── splash.png           # Splash screen
│   └── apps-store-ipad/     # iPad marketing screenshots
├── src/
│   ├── app.tsx              # Native navigation and Capacitor outlet
│   ├── main.tsx             # React bootstrap, theme, transitions, updater
│   ├── router.tsx           # React Router routes
│   ├── layouts/
│   │   └── tab-layout.tsx   # Native tab bar height handling
│   ├── pages/app/
│   │   ├── home.tsx         # Slap mode
│   │   └── settings.tsx     # Thief mode
│   ├── assets/sounds/       # Bundled sounds
│   └── components/          # UI components
├── android/                 # Native Android project
├── ios/                     # Native iOS project
├── scripts/dev-mobile.mjs   # Mobile live reload helper
├── capacitor.config.ts      # Capacitor configuration
└── vite.config.ts           # Vite + Capgo configuration
```

## Capacitor Configuration

The app is configured in `capacitor.config.ts` with:

- `appId`: `com.slapphone.app`
- `appName`: `Slap Phone`
- `webDir`: `dist`
- green splash screen without spinner
- status bar overlaying the WebView
- keyboard resizing on the `body`
- Capgo updater enabled with auto-update

## Notes

- `Slap` mode uses a 600 ms cooldown to avoid rapid repeated triggers.
- Sensitivity thresholds are defined in `src/pages/app/home.tsx`.
- `Thief` mode triggers the siren when movement exceeds its threshold after arming.
- The app does not currently include an authentication flow or Supabase configuration, even though the Supabase dependency is still present in `package.json`.
