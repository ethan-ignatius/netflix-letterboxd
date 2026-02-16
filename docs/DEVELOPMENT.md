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
