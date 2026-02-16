# Development

## Prerequisites

- Node.js 18+
- npm

## Install

```bash
npm install
```

## Build

```bash
npm run build
```

## Load Unpacked Extension

1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the `dist` folder.

## Development Watch

```bash
npm run dev
```

This runs Vite builds in watch mode for content + app bundles.

## Logs

- Content script logs appear in the Netflix page DevTools console.
- Background logs appear in the service worker console under the extension in `chrome://extensions/`.
- Popup logs appear in the popup DevTools console.

Note: Logs are gated behind the `DEBUG` constant and are only active in development builds.

## Manual Test Plan

1. Build and load unpacked from `dist/`.
2. On `netflix.com/browse`, confirm the Letterboxd badge appears bottom-right.
3. Hover a title to expand the jawbone card and confirm the overlay panel mounts.
4. Start playback (`/watch/...`) and confirm the badge hides.
5. Return to browse and confirm the badge reappears.
6. Import a Letterboxd export ZIP and verify watchlist/rating badges update.
