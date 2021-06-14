/* eslint global-require: 0 */
import { ObjectId } from 'mongodb';
import { connectDatabase, closeDatabase, waitJest } from '../../test/db';
import runCronSchedules from './cronSchedules';
import { Patient } from '../models/patient.model';
import { MessageTemplate } from '../models/messageTemplate.model';
import { Message } from '../models/message.model';

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
    it('Runs CRON every day at 12:00', async (done) => {
      const logSpy = jest.spyOn(console, 'log');
      cron.schedule.mockImplementation(async (frequency: any, callback: any) =>
        callback(),
      );
      await createPatient();
      await createMessageTemplate();
      const cronRunTime = new Date().getTime();
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
      await waitJest(1200);
      const messages = await Message.find({ phoneNumber: '111' });
      expect(messages[0]?.sent).toBeFalsy();
      expect(Math.abs(messages[0].date.getTime() - cronRunTime)).toBeLessThan(
        1000 * 90,
      );
      expect(
        Math.abs(messages[0].date.getTime() - cronRunTime),
      ).toBeGreaterThan(1000 * 30);
      done();
    });
  });
} else {
  it('backgroundJobs', () => {
    expect(1).toBeTruthy();
  });
}
