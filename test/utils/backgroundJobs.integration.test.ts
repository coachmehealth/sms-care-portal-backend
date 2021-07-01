import {
  connectDatabase,
  closeDatabase,
  clearDatabase,
  waitJest,
  createPatient,
  createOutcome,
  createMessageTemplate,
} from '../db';
import runCronSchedules from '../../src/background_jobs/cronSchedules';
import { Patient } from '../../src/models/patient.model';
import { Message } from '../../src/models/message.model';
import {
  dailyMidnightMessages,
  weeklyReport,
} from '../../src/background_jobs/utils';
import { Schedule } from '../../src/models/schedule.model';

const cron = require('node-cron');

jest.mock('node-cron', () => {
  return {
    schedule: jest.fn(),
  };
});

if (process.env.NODE_ENV === 'development') {
  beforeAll(() => connectDatabase());
  beforeEach(async () => clearDatabase());
  afterAll(() => closeDatabase());

  const getDateRelativeToMonday = (offset: number) => {
    const lastMonday = new Date();
    lastMonday.setDate(lastMonday.getDate() - ((lastMonday.getDay() + 6) % 7));
    lastMonday.setDate(lastMonday.getDate() + offset);
    return lastMonday;
  };

  describe('Message utils', () => {
    jest.useFakeTimers();
    it('runCronSchedules() schedules get called at the appropiate times  ', async (done) => {
      const logSpy = jest.spyOn(console, 'log');
      cron.schedule.mockImplementation(async (frequency: any, callback: any) =>
        callback(),
      );
      runCronSchedules();
      expect(logSpy).toBeCalledWith('Running batch of scheduled messages');
      expect(cron.schedule).toBeCalledWith(
        '0 0 5 * * *',
        expect.any(Function),
        {
          scheduled: true,
          timezone: 'America/Los_Angeles',
        },
      );
      expect(cron.schedule).toBeCalledWith('0 11 * * *', expect.any(Function), {
        scheduled: true,
        timezone: 'America/Los_Angeles',
      });
      done();
    });

    it('sends midnight messages', async (done) => {
      await createPatient('111');
      await createMessageTemplate();
      dailyMidnightMessages();
      await waitJest(400);
      const messages = await Message.find({ phoneNumber: '111' });
      expect(messages[0]?.sent).toBeFalsy();
      done();
    });

    it('weekly reports saves the time it last ran. And does not run', async (done) => {
      weeklyReport();
      await waitJest(500);
      const schedule = await Schedule.find({});
      expect(schedule[0]?.weeklyReport).toBeTruthy();
      done();
    });

    it('weekly reports does not run if it ran this week', async (done) => {
      const tuesdayAfterLastMonday = getDateRelativeToMonday(1);
      await new Schedule({ weeklyReport: tuesdayAfterLastMonday }).save();
      weeklyReport();
      await waitJest(500);
      const schedule = await Schedule.find({});
      expect(schedule[0]?.weeklyReport > tuesdayAfterLastMonday).toBeFalsy();
      done();
    });

    it('weekly reports run if it has not run this week', async (done) => {
      const lastSunday = getDateRelativeToMonday(-1);
      await new Schedule({ weeklyReport: lastSunday }).save();
      await createPatient('111');
      const patient = await Patient.findOne({});
      if (patient) {
        await createOutcome(patient, getDateRelativeToMonday(1), 97, 'green');
        await createOutcome(patient, getDateRelativeToMonday(0), 77, '<80');
        await createOutcome(patient, getDateRelativeToMonday(-1), 99, 'green');
        await createOutcome(
          patient,
          getDateRelativeToMonday(-0.6),
          111,
          'green',
        );
        await createOutcome(patient, getDateRelativeToMonday(-2), 121, 'green');
        await createOutcome(
          patient,
          getDateRelativeToMonday(-5),
          150,
          'yellow',
        );
      }

      weeklyReport();
      await waitJest(500);
      const message = await Message.findOne({});
      const schedule = await Schedule.find({});
      expect(schedule[0]?.weeklyReport > lastSunday).toBeTruthy();
      expect(message?.message.includes('Tue')).toBeFalsy();
      expect(message?.message.includes('Sat')).toBeTruthy();
      expect(message?.message.includes('111')).toBeTruthy();
      expect(message?.sent).toBeFalsy();
      done();
    });
  });
} else {
  it('backgroundJobs', () => {
    expect(1).toBeTruthy();
  });
}
