# Architecture

## Runtime Boundaries

- Content script (`src/content`) runs on `https://www.netflix.com/*` and only manipulates Netflix DOM. It does not call external APIs directly.
- Background service worker (`src/background`) owns all TMDb requests, Letterboxd matching, and caching.
- Popup UI (`src/popup`) is responsible for user configuration (overlay toggle, TMDb key, Letterboxd export import).
- Shared utilities (`src/shared`) host types, storage keys, normalization helpers, and logging.

## Content Script Responsibilities

- Detect the expanded Netflix “jawbone” card using DOM heuristics.
- Extract a stable show/movie title for lookup.
- Inject the top panel UI and status badge using Shadow DOM.
- Send `RESOLVE_TITLE` messages to the background worker.

## Background Worker Responsibilities

- Resolve titles via TMDb search + details.
- Enrich results with Letterboxd watchlist/rating data.
- Build and cache a taste profile based on Letterboxd ratings.
- Return `TITLE_RESOLVED` messages to the content script.

## Popup Responsibilities

- Enable/disable overlay.
- Save TMDb API key.
- Import Letterboxd export ZIP and store compact index.
- Clear caches and user data on request.

## Data Flow: Hovering an Expanded Netflix Card

1. Content script observes DOM changes and finds an expanded card.
2. It extracts the best display title and sends `RESOLVE_TITLE` to the background worker.
3. Background resolves via TMDb, pulls Letterboxd data, computes match score.
4. Background replies with `TITLE_RESOLVED`.
5. Content script updates the top panel UI.

## Data Flow: Letterboxd Import

1. User uploads export ZIP in the popup.
2. Popup parses `ratings.csv` + `watchlist.csv` and builds a compact index.
3. Index + stats are stored in `chrome.storage.local`.
4. Background uses this local index to add watchlist/rating badges and compute match scores.
