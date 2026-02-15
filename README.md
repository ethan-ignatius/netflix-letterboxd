# Netflix + Letterboxd (Chrome Extension)

## Overview
Manifest V3 Chrome extension scaffold using TypeScript + Vite. Content script injects a Shadow DOM overlay on Netflix pages. All data is stored locally via `chrome.storage.local` and is intended to be populated by a user-uploaded Letterboxd export ZIP.

## Scripts
- `npm run dev` - build in watch mode
- `npm run build` - production build to `dist/`
- `npm run lint` - run ESLint
- `npm run typecheck` - run TypeScript typecheck

## Build And Load Unpacked Extension
1. `npm install`
2. `npm run build`
3. Open Chrome and go to `chrome://extensions/`
4. Enable **Developer mode** (top right)
5. Click **Load unpacked**
6. Select the `dist` folder in this project

## Project Structure
- `src/content/index.ts` - content script
- `src/background/index.ts` - service worker
- `src/popup/index.html` - popup HTML
- `src/popup/main.ts` - popup logic
- `src/popup/style.css` - popup styles
- `src/shared/types.ts` - shared types
- `src/shared/storage.ts` - storage helpers
- `src/shared/log.ts` - debug logging
- `manifest.json` - extension manifest
