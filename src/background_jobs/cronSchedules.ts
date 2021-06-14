import { dailyMidnightMessages, weeklyReport } from './utils';

const cron = require('node-cron');

const runCronSchedules = () => {
  // run messages every day at midnight PST
  cron.schedule('0 0 5 * * *', () => dailyMidnightMessages(), {
    scheduled: true,
    timezone: 'America/Los_Angeles',
  });

  // Send report every monday at 11 AM. PST.
  cron.schedule('0 11 * * *', () => weeklyReport(), {
    scheduled: true,
    timezone: 'America/Los_Angeles',
  });
};

export default runCronSchedules;
