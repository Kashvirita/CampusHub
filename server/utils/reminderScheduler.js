const Event = require('../models/Event');
const { sendReminder } = require('./sendMail');

const HOUR_MS = 60 * 60 * 1000;
const CHECK_INTERVAL_MS = HOUR_MS;

// Find upcoming events within the next ~25h that haven't had reminders sent,
// email each registered student, and mark the event so we don't re-send.
const runReminderSweep = async () => {
  try {
    const now = new Date();
    const cutoff = new Date(now.getTime() + 25 * HOUR_MS);

    const events = await Event.find({
      date: { $gte: now, $lte: cutoff },
      remindersSent: false,
      status: 'upcoming',
    });

    if (events.length === 0) return;

    console.log(`📬 Reminder sweep: ${events.length} event(s) due in next 25h`);

    for (const event of events) {
      const recipients = (event.registeredUsers || []).filter((u) => u.email);
      if (recipients.length === 0) {
        event.remindersSent = true;
        await event.save();
        continue;
      }

      const results = await Promise.allSettled(
        recipients.map((u) =>
          sendReminder({
            studentName: u.name || 'there',
            studentEmail: u.email,
            event,
          })
        )
      );

      const sent = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.length - sent;
      console.log(
        `📨 ${event.title}: sent ${sent} reminder(s)${failed ? `, ${failed} failed` : ''}`
      );

      event.remindersSent = true;
      await event.save();
    }
  } catch (err) {
    console.error('Reminder sweep error:', err);
  }
};

const startReminderScheduler = () => {
  // Run shortly after startup to catch anything overdue, then hourly.
  setTimeout(runReminderSweep, 30 * 1000);
  setInterval(runReminderSweep, CHECK_INTERVAL_MS);
  console.log('⏰ Reminder scheduler started (hourly sweep)');
};

module.exports = { startReminderScheduler, runReminderSweep };
