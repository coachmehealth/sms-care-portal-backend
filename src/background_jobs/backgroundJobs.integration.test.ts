/* eslint global-require: 0 */
import { ObjectId } from 'mongodb';
import {
  connectDatabase,
  closeDatabase,
  clearDatabase,
  waitJest,
} from '../../test/db';
import runCronSchedules from './cronSchedules';
import { IPatient, Patient } from '../models/patient.model';
import { MessageTemplate } from '../models/messageTemplate.model';
import { Message } from '../models/message.model';
import { dailyMidnightMessages, weeklyReport } from './utils';
import { Schedule } from '../models/schedule.model';
import { Outcome } from '../models/outcome.model';

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

  const createOutcome = async (
    patient: IPatient,
    date: Date,
    value: number,
    alertType: string,
  ) => {
    const newOutcome = new Outcome({
      patientID: patient._id,
      phoneNumber: patient.phoneNumber,
      date,
      response: `my glucose is ${value}`,
      value,
      alertType,
    });
    await newOutcome.save();
  };

  const createMessageTemplate = async () => {
    const newMessageTemplate = new MessageTemplate({
      text: 'Health is fun!',
      language: 'english',
      type: 'Initial',
    });
    await newMessageTemplate.save();
  };

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
      await createPatient();
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
      await createPatient();
      const patient = await Patient.findOne({});
      if (patient) {
        // eslint-disable-next-line prettier/prettier
        await createOutcome(patient, getDateRelativeToMonday(1), 97, 'green');
        // eslint-disable-next-line prettier/prettier
        await createOutcome(patient, getDateRelativeToMonday(0), 77, '<80');
        // eslint-disable-next-line prettier/prettier
        await createOutcome(patient, getDateRelativeToMonday(-1), 99, 'green');
        // eslint-disable-next-line prettier/prettier
        await createOutcome(patient, getDateRelativeToMonday(-.6), 111, 'green');
        // eslint-disable-next-line prettier/prettier
        await createOutcome(patient, getDateRelativeToMonday(-2), 121, 'green');
        // eslint-disable-next-line prettier/prettier
        await createOutcome(patient, getDateRelativeToMonday(-5), 150, 'yellow');
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
