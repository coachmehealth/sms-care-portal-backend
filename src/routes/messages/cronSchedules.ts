import { dailyMidnightMessages, weeklyReport } from './utils';
const cron = require('node-cron');

export const runCronSchedules = () => {
  // run messages every day at midnight PST
  cron.schedule('0 0 5 * * *', () => dailyMidnightMessages(), {
    scheduled: true,
    timezone: 'America/Los_Angeles',
  });

  // Send report every monday at 11 AM. PST.
  cron.schedule('0 11 * * 1', () => weeklyReport(), {
    scheduled: true,
    timezone: 'America/Los_Angeles',
  });

  cron.schedule('* * * * *', () => console.log("every min ", new Date()), {
    scheduled: true,
    timezone: 'America/Los_Angeles',
  });
}
