# Repository Agent Instructions

## Constraints
- Chrome extension Manifest V3
- TypeScript
- Use Vite for bundling
- Content script runs on https://www.netflix.com/*
- Inject overlay UI using Shadow DOM to avoid CSS conflicts
- No scraping Letterboxd pages; personalization must come from user-uploaded Letterboxd export ZIP
- Store everything locally using chrome.storage.local
- Keep code modular: content/, background/, popup/, shared/
- Add thorough console logging behind a DEBUG flag
