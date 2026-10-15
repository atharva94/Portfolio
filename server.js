import 'dotenv/config';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import nodemailer from 'nodemailer';
import { resolve } from 'node:path';

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const fromAddress = 'atharva.pethkar90@gmail.com';
const toAddress = 'atharva.pethkar9@gmail.com';
const validInterests = new Set([
  'Project or product',
  'Full-time opportunity',
  'Freelance or consulting',
  'Something else',
]);

app.disable('x-powered-by');
app.use((request, response, next) => {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('X-Frame-Options', 'DENY');
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
app.use(express.json({ limit: '10kb' }));

const contactRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many messages. Please wait a little and try again.' },
});

app.get('/contact', (_request, response) => {
  response.redirect(308, '/contact.html');
});

app.post('/api/contact', contactRateLimit, async (request, response) => {
  const { name, email, phone = '', interest, message, website = '' } = request.body ?? {};

  if ([name, email, phone, interest, message, website].some((value) => typeof value !== 'string')) {
    return response.status(400).json({ error: 'Please complete the form using valid text values.' });
  }

  if (website.trim()) {
    return response.status(400).json({ error: 'The message could not be accepted.' });
  }

  const cleanName = name.trim().replace(/[\r\n]/g, ' ');
  const cleanEmail = email.trim();
  const cleanPhone = phone.trim().replace(/[\r\n]/g, ' ');
  const cleanInterest = interest.trim();
  const cleanMessage = message.trim();

  if (
    cleanName.length < 2 ||
    cleanName.length > 120 ||
    cleanEmail.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) ||
    cleanPhone.length > 40 ||
    !validInterests.has(cleanInterest) ||
    cleanMessage.length < 20 ||
    cleanMessage.length > 5000
  ) {
    return response.status(400).json({ error: 'Please check your contact details and message, then try again.' });
  }

  if (!process.env.GMAIL_APP_PASSWORD) {
    return response.status(503).json({
      error: 'The contact form is not configured yet. Please email atharva.pethkar9@gmail.com instead.',
    });
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: fromAddress,
      pass: process.env.GMAIL_APP_PASSWORD.replace(/\s/g, ''),
    },
  });

  try {
    await transporter.sendMail({
      from: { name: 'Atharva Pethkar — Portfolio', address: fromAddress },
      to: toAddress,
      replyTo: { name: cleanName, address: cleanEmail },
      subject: `Portfolio enquiry — ${cleanName}`,
      text: [
        'A new message was sent from your portfolio.',
        '',
        `Name: ${cleanName}`,
        `Email: ${cleanEmail}`,
        `Phone: ${cleanPhone || 'Not provided'}`,
        `Interested in: ${cleanInterest}`,
        '',
        'Message:',
        cleanMessage,
      ].join('\n'),
    });
  } catch (error) {
    console.error('[contact] Email delivery failed:', error);
    return response.status(502).json({
      error: 'Your message could not be sent right now. Please try again later or email me directly.',
    });
  }

  return response.status(200).json({
    message: 'Your message has been sent. Thanks for getting in touch!',
  });
});

app.use('/api', (_request, response) => {
  response.status(404).json({ error: 'API endpoint not found.' });
});

app.use((error, request, response, next) => {
  if (!request.path.startsWith('/api/')) return next(error);

  const status = error.status === 413 ? 413 : 400;
  const message = status === 413
    ? 'Your message is too large. Please shorten it and try again.'
    : 'The request could not be read. Please check the form and try again.';
  return response.status(status).json({ error: message });
});

if (isProduction) {
  app.use(express.static(resolve('dist')));
} else {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'mpa',
  });
  app.use(vite.middlewares);
}

app.use((_request, response) => {
  response.status(404).send('Page not found.');
});

const port = Number(process.env.PORT || (isProduction ? 4173 : 5173));
app.listen(port, () => {
  console.log(`Portfolio server listening on http://localhost:${port}`);
});
