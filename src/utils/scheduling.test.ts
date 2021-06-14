import { connectDatabase, closeDatabase, clearDatabse } from '../../test/db';
import initializeScheduler from './scheduling';
import { Message } from '../models/message.model';
import { Patient } from '../models/patient.model';

beforeAll(() => connectDatabase());
beforeEach(() => {
  jest.useFakeTimers();
});
afterEach(async () => {
  jest.clearAllTimers();
  jest.useRealTimers();
  await clearDatabse();
});

afterAll(() => closeDatabase());

describe('Scheduling tests', () => {
  it('sends scheduled messages', async (done) => {
    const patientPhone = '12';
    const patient = new Patient({
      firstName: 'jest',
      lastName: 'jester',
      coachID: '60ac2a4b01d7157738425700',
      coachName: 'jest coach',
      language: 'english',
      phoneNumber: patientPhone,
      prefTime: 12.2,
      messagesSent: 0,
      responseCount: 0,
      reports: [],
      enabled: true,
    });

    await patient.save();
    const today = new Date();
    today.setSeconds(today.getSeconds() + 1);

    const message = new Message({
      phoneNumber: patientPhone,
      patientID: '60aebf123fbd20eba237244e',
      message: 'Test scheduled message',
      sender: 'GLUCOSE BOT',
      date: today,
      sent: false,
    });

    await message.save();

    const msgbefore = await Message.findOne({ phoneNumber: patientPhone });
    expect(msgbefore?.sent).toBeFalsy();
    initializeScheduler();
    jest.useRealTimers();
    await new Promise((resolve) => setTimeout(resolve, 1200));
    jest.useFakeTimers();
    const msgafter = await Message.findOne({ phoneNumber: patientPhone });
    expect(msgafter?.sent).toBeTruthy();
    done();
  });
});
