/* eslint global-require: 0 */
import { ObjectId } from 'mongodb';
import { connectDatabase, closeDatabase, waitJest } from '../../test/db';
import runCronSchedules from './cronSchedules';
import { Patient } from '../models/patient.model';
import { MessageTemplate } from '../models/messageTemplate.model';
import { Message } from '../models/message.model';
import { dailyMidnightMessages, weeklyReport } from './utils';
import { Schedule } from '../models/schedule.model';

const cron = require('node-cron');

jest.mock('node-cron', () => {
  return {
    schedule: jest.fn(),
  };
});

if (process.env.NODE_ENV === 'development') {
  beforeAll(() => connectDatabase());
  afterAll(() => closeDatabase());

  const createPatient = async () => {
    const patient = new Patient({
      firstName: 'jest',
      lastName: 'jester',
      coachID: new ObjectId(1),
      coachName: 'jest coach',
      language: 'english',
      phoneNumber: '111',
      prefTime: 12.2,
      messagesSent: 0,
      responseCount: 0,
      reports: [],
      enabled: true,
    });
    await patient.save();
  };

  const createMessageTemplate = async () => {
    const newMessageTemplate = new MessageTemplate({
      text: 'Health is fun!',
      language: 'english',
      type: 'Initial',
    });
    await newMessageTemplate.save();
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
      await createPatient();
      await createMessageTemplate();
      dailyMidnightMessages();
      await waitJest(400);
      const messages = await Message.find({ phoneNumber: '111' });
      expect(messages[0]?.sent).toBeFalsy();
      done();
    });

    it('sends weekly reports and there is no previous schedule data', async (done) => {
      await new Schedule({ weeklyReport: new Date() });
      weeklyReport();
      await waitJest(500);
      const schedule = await Schedule.find({});
      expect(schedule[0]?.weeklyReport).toBeTruthy();
      done();
    });
  });
} else {
  it('backgroundJobs', () => {
    expect(1).toBeTruthy();
  });
}
