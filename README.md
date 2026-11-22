# Tatkal Booking Assistant Advanced

A mobile-first, offline-capable Progressive Web App (PWA) to prepare for a Tatkal journey. Independent and not affiliated with IRCTC.

## Features

- Responsive Hindi/Hinglish interface for Android and desktop.
- Save journey route, train, date, quota and class locally on this device.
- Prepare up to six passenger names and ages.
- Pre-booking checklist with progress tracking.
- JSON backup and restore for trip, passenger and checklist data.
- Installable PWA where supported by the browser and secure context.
- Offline app shell via service worker.
- Official railway links: IRCTC train search, NTES and Indian Railways.
- GitHub Actions checks JavaScript syntax and required PWA assets.

## Run locally

Requirements: Node.js 22+ for validation; a local static web server for app use.

1. Clone this repository.
2. Start a local static server in the project root, for example:

   ```bash
   npx serve .
   ```

3. Open the localhost URL. Service workers and PWA installation require localhost or HTTPS.
4. On Android Chrome, use the browser menu and choose **Install app** / **Add to Home screen** when available. The in-app Install button appears only when the browser offers the install prompt.

Validate the project:

```bash
npm run check
```

## Privacy and backups

Trip and passenger preparation data is stored in browser local storage on this device. JSON backup files contain the same information; keep them private and delete them when no longer needed. Clearing browser site data may erase local data. Do not enter passwords, OTPs, Aadhaar numbers, card details, UPI PINs or other sensitive information. The app does not send this data to a server.

## Booking and safety

This app does not book tickets, access IRCTC accounts, store credentials, automate payment, bypass CAPTCHA/OTP or circumvent IRCTC limits. Train information links open official railway websites; live data is provided by those sites, not by this app. Complete booking yourself through [IRCTC](https://www.irctc.co.in/nget/train-search).

## Project structure

- `index.html` — app interface
- `styles.css` — responsive styling
- `app.js` — local state, passenger list, backup/restore and install prompt
- `manifest.json` — PWA metadata
- `sw.js` — offline app-shell cache
- `scripts/check.js` — project structure validation
- `.github/workflows/ci.yml` — CI checks

## License

No license has been added yet. All rights remain with the repository owner unless a license is added.
