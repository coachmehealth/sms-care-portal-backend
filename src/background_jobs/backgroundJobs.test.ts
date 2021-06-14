/* eslint global-require: 0 */
import { ObjectId } from 'mongodb';
import { connectDatabase, closeDatabase, clearDatabase } from '../../test/db';
import {
  compareOutcomesByDate,
  returnColorRanges,
  getAverageAndCounts,
  getWeeklyList,
  getMessageTemplate,
} from './utils';
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

beforeAll(() => connectDatabase());
beforeEach(() => {
  jest.useFakeTimers();
});
afterEach(async () => {
  jest.clearAllTimers();
  jest.useRealTimers();
  await clearDatabase();
});

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
const waitJest = async () => {
  jest.useRealTimers();
  await new Promise((resolve) => setTimeout(resolve, 500));
  jest.useFakeTimers();
};

describe('Message utils', () => {
  it('compareOutcomesByDate() Compares outcomes objects by date', () => {
    const outcomeOld: any = {
      _id: '12093uqdsj01212d',
      patientID: 'alskdjalsdkj2id2d2',
      phoneNumber: '999-999-9999',
      date: new Date(2021, 10, 10, 5),
      response: 'old',
      value: 122,
      alertType: 'green',
    };
    const outcomeNew: any = {
      _id: '12093uqdsj01212d',
      patientID: 'alskdjalsdkj2id2d2',
      phoneNumber: '999-999-9999',
      date: new Date(2021, 12, 12, 2),
      response: 'old',
      value: 90,
      alertType: 'green',
    };
    expect(compareOutcomesByDate(outcomeNew, outcomeOld)).toEqual(1);
  });

  it('returnColorRanges() Returns the proper color ranges', () => {
    expect(returnColorRanges(50)).toEqual('⚪');
    expect(returnColorRanges(100)).toEqual('🟢');
    expect(returnColorRanges(145)).toEqual('🟡');
    expect(returnColorRanges(189)).toEqual('🔴');
  });

  it('getWeeklyList() Returns the proper language', () => {
    expect(getWeeklyList(5, 110, { monday: 4 }, 'spanish')).toContain(
      'Promedio',
    );
    expect(getWeeklyList(5, 110, { monday: 4 }, 'english')).toContain(
      'Average',
    );
  });

  it('getMessageTemplate() Returns the proper language', () => {
    expect(getMessageTemplate(4, 5, 110, { monday: 110 }, 'spanish')).toContain(
      'días',
    );
    expect(getMessageTemplate(4, 5, 110, { monday: 120 }, 'english')).toContain(
      'days',
    );
  });

  it('getAverageAndCounts() Correctly counts and averages the data', () => {
    const weeklyData = {
      monday: 99,
      tuesday: 180,
      wednesday: 70,
      thursday: 120,
    };
    expect(getAverageAndCounts(weeklyData)).toStrictEqual([117, 4, 2]);
  });

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
    expect(cron.schedule).toBeCalledWith('0 0 5 * * *', expect.any(Function), {
      scheduled: true,
      timezone: 'America/Los_Angeles',
    });
    await waitJest();
    const messages = await Message.find({ phoneNumber: '111' });
    expect(messages[0]?.sent).toBeFalsy();
    expect(Math.abs(messages[0].date.getTime() - cronRunTime)).toBeLessThan(
      1000 * 90,
    );
    expect(Math.abs(messages[0].date.getTime() - cronRunTime)).toBeGreaterThan(
      1000 * 30,
    );
    done();
  });
});
