import cron from 'cron';
import { dailyMidnightMessages, weeklyReport } from './utils';

const runCronSchedules = () => {
  // run messages every day at midnight PST
  const dailyMidnightMessagesJob = new cron.CronJob({
    cronTime: '0 0 5 * * *',
    onTick: () => dailyMidnightMessages(),
    timeZone: 'America/Los_Angeles',
  });
  dailyMidnightMessagesJob.start();

  // Send report every monday at 11 AM. PST.
  const weeklyReportJob = new cron.CronJob({
    cronTime: '* 10 * * *',
    onTick: () => weeklyReport(),
    timeZone: 'America/Los_Angeles',
  });
  weeklyReportJob.start();
};

export default runCronSchedules;
