# Atharva Pethkar — Portfolio

A responsive developer portfolio built with semantic HTML, CSS, JavaScript, and a custom Three.js hero scene. The portfolio highlights selected project work, technical capabilities, education, and verified profile links without a separate work-experience timeline.

## Contact form email setup

The contact form sends visitor messages through Gmail SMTP on the server. The sender is `atharva.pethkar90@gmail.com`, the recipient is `atharva.pethkar9@gmail.com`, and the visitor's email is set as the reply-to address.

1. Enable two-step verification on the sender Gmail account and create a Google App Password.
2. Copy `.env.example` to `.env` and set `GMAIL_APP_PASSWORD` to that App Password. Keep `.env` private; it is excluded from Git.
3. Run `npm run dev`. The contact form page is at `/contact.html`.

Deploy the Node server with `npm run build` followed by `npm start`, set `NODE_ENV=production`, and add `GMAIL_APP_PASSWORD` as a secret in the hosting provider's environment settings. Do not add the Gmail password to frontend code or commit it. If the password is not configured, the form displays an explicit setup message rather than claiming the email was sent.

## Run locally

```sh
npm install
npm run dev
```

Vite prints the local development URL in the terminal.

## Production build

```sh
npm run build
npm run preview
```

The site respects reduced-motion preferences and adapts its layout for smaller screens.

Selected work is summarized from the resume. Client and internal projects are described at a high level; no private source code or project links are implied.
