/* eslint global-require: 0 */

import {
  compareOutcomesByDate,
  returnColorRanges,
  getAverageAndCounts,
  getWeeklyList,
  getMessageTemplate,
} from './utils';
import runCronSchedules from './cronSchedules';

const cron = require('node-cron');

jest.mock('node-cron', () => {
  return {
    schedule: jest.fn(),
  };
});

jest.useFakeTimers();

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

  it('Runs CRON every day at 12:00 and at 11:00 AM every monday', () => {
    const logSpy = jest.spyOn(console, 'log');
    cron.schedule.mockImplementation(async (frequency: any, callback: any) =>
      callback(),
    );
    runCronSchedules();
    expect(logSpy).toBeCalledWith('Running batch of scheduled messages');
    expect(cron.schedule).toBeCalledWith('0 0 5 * * *', expect.any(Function), {
      scheduled: true,
      timezone: 'America/Los_Angeles',
    });

    expect(logSpy).toBeCalledWith('Running weekly report messages');
    expect(cron.schedule).toBeCalledWith('0 11 * * 1', expect.any(Function), {
      scheduled: true,
      timezone: 'America/Los_Angeles',
    });
  });
});