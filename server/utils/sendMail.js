const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

const sendMail = async ({ to, subject, text, html }) => {
  if (!to) throw new Error('Recipient email required');
  return transporter.sendMail({
    from: `"CampusHub" <${process.env.EMAIL}>`,
    to,
    subject,
    text,
    html,
  });
};

const eventUrl = (eventId) => {
  const base = process.env.CLIENT_BASE_URL || 'http://localhost:5173';
  return `${base}/event/${eventId}`;
};

const formatEventDate = (d) =>
  new Date(d).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

// Email templates ------------------------------------------------------------

const emailShell = (heading, bodyHtml, ctaUrl) => `
<div style="font-family:-apple-system,Inter,Segoe UI,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#fff;color:#0f172a;">
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:32px;">
    <div style="width:32px;height:32px;background:#2E5AA7;border-radius:8px;display:flex;align-items:center;justify-content:center;">
      <div style="width:12px;height:12px;background:#FFA628;border-radius:2px;"></div>
    </div>
    <strong style="font-size:18px;letter-spacing:-0.01em;">CampusHub</strong>
  </div>
  <h1 style="font-size:24px;font-weight:600;letter-spacing:-0.02em;margin:0 0 16px;">${heading}</h1>
  ${bodyHtml}
  ${ctaUrl ? `
  <div style="margin:32px 0;">
    <a href="${ctaUrl}" style="display:inline-block;background:#2E5AA7;color:#fff;font-weight:500;padding:12px 24px;border-radius:10px;text-decoration:none;">View event details</a>
  </div>` : ''}
  <hr style="border:0;border-top:1px solid #e2e8f0;margin:32px 0 16px;">
  <p style="font-size:13px;color:#94a3b8;margin:0;">You're receiving this because you registered on CampusHub.</p>
</div>`;

const eventInfoBlock = (event) => `
<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:16px 0;">
  <p style="margin:0 0 10px;font-weight:600;font-size:16px;">${event.title}</p>
  <p style="margin:6px 0;font-size:14px;color:#475569;">📅 ${formatEventDate(event.date)}</p>
  <p style="margin:6px 0;font-size:14px;color:#475569;">⏰ ${event.startTime} – ${event.endTime}</p>
  <p style="margin:6px 0;font-size:14px;color:#475569;">📍 ${event.location}</p>
  <p style="margin:6px 0;font-size:14px;color:#475569;">👥 Hosted by ${event.committeeName}</p>
</div>`;

const sendRsvpConfirmation = async ({ studentName, studentEmail, event }) => {
  const html = emailShell(
    `You're registered, ${studentName.split(' ')[0]} 🎉`,
    `<p style="font-size:15px;color:#475569;line-height:1.6;margin:0 0 16px;">
       You're all set for the event below. We'll send you a reminder 24 hours before.
     </p>
     ${eventInfoBlock(event)}`,
    eventUrl(event._id)
  );
  const text = `You're registered for ${event.title}\n\n${formatEventDate(event.date)} · ${event.startTime}–${event.endTime}\n${event.location}\nHosted by ${event.committeeName}\n\nView: ${eventUrl(event._id)}`;
  return sendMail({
    to: studentEmail,
    subject: `You're registered for ${event.title}`,
    text,
    html,
  });
};

const sendReminder = async ({ studentName, studentEmail, event }) => {
  const html = emailShell(
    `Tomorrow: ${event.title}`,
    `<p style="font-size:15px;color:#475569;line-height:1.6;margin:0 0 16px;">
       Hi ${studentName.split(' ')[0]}, just a heads-up — your registered event is coming up tomorrow.
     </p>
     ${eventInfoBlock(event)}`,
    eventUrl(event._id)
  );
  const text = `Reminder: ${event.title} is tomorrow\n\n${formatEventDate(event.date)} · ${event.startTime}–${event.endTime}\n${event.location}\n\nView: ${eventUrl(event._id)}`;
  return sendMail({
    to: studentEmail,
    subject: `Reminder: ${event.title} is tomorrow`,
    text,
    html,
  });
};

module.exports = { sendMail, sendRsvpConfirmation, sendReminder };
