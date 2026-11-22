# Tatkal Booking Assistant Advanced

A mobile-first, offline-capable Progressive Web App (PWA) to prepare for a Tatkal journey. This is an independent preparation tool and is **not affiliated with IRCTC**.

## Features

- Responsive Hinglish-friendly interface for Android and desktop.
- Save journey route, train, date, quota and class locally on the device.
- Prepare up to six passenger names and ages (do not enter sensitive identity or payment data).
- Pre-booking checklist with progress tracking.
- Offline app shell using a service worker.
- GitHub Actions workflow for JavaScript syntax validation.
- Direct link to the official IRCTC train search page.

## Run locally

Requirements: Node.js 22+ (only needed for the validation command).

1. Clone this repository.
2. Start a local static server from the project root, for example:

   ```bash
   npx serve .
   ```

3. Open the local URL shown by the server. For PWA installation and service-worker support, use localhost or HTTPS.
4. On Android Chrome, use the browser menu and choose **Install app** / **Add to Home screen** when available.

Run the JavaScript syntax check:

```bash
npm run check
```

## Privacy

Trip and passenger preparation data is stored in this browser's local storage on this device. Clearing browser site data may erase it. Do not enter passwords, OTPs, Aadhaar numbers, card details, UPI PINs, or other sensitive information. The app does not send this data to a server.

## Booking and safety

This app does not book tickets, access IRCTC accounts, store credentials, automate payment, bypass CAPTCHA/OTP, or circumvent IRCTC limits. Verify train and journey details and complete any booking yourself through the official [IRCTC website](https://www.irctc.co.in/nget/train-search). Availability, booking rules and opening times are controlled by IRCTC and may change.

## Project structure

- `index.html` — app interface
- `styles.css` — responsive styling
- `app.js` — local state, passenger list and checklist
- `manifest.json` — PWA metadata
- `sw.js` — offline app-shell cache
- `.github/workflows/ci.yml` — CI syntax check

## License

No license has been added yet. All rights remain with the repository owner unless a license is added.
