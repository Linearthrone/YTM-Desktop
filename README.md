# YTM-Desktop

Xbox Game Bar–style YouTube Music overlay for Windows.

## Features

- Global hotkey toggle (`Win+Y`, falls back to `Ctrl+Shift+Y`)
- Draggable frameless glass overlay with last-position restore
- System tray: **Open** / **Exit**
- Pin to keep visible and always on top
- Neon themes + translucency slider
- Account avatar with Sign in / Sign out / Settings
- Transport controls including **Like** and **Dislike**
- Arc shelves: Listen Again, Quick Picks, Forgotten Favorites
- Shared bottom drawer + two-phase search

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run dist
```

## Notes

Sign-in uses an Electron window against `music.youtube.com` so session cookies stay in the app (required for YouTube Music APIs). Sign-out clears the local session and opens Google logout in your default browser.
