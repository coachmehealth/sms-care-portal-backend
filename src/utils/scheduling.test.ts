import { connectDatabase, closeDatabase, clearDatabse } from '../../test/db';
import initializeScheduler from './scheduling';
import { Message } from '../models/message.model';
import { Patient } from '../models/patient.model';

beforeAll(() => connectDatabase());
beforeEach(() => {
  jest.useFakeTimers();
});
afterEach(async () => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
  await clearDatabse();
});

afterAll(() => closeDatabase());

describe('Scheduling tests', () => {
  it('runs scheduling', async (done) => {
    const patient = new Patient({
      firstName: 'jest',
      lastName: 'jester',
      coachID: '60ac2a4b01d7157738425700',
      coachName: 'jest coach',
      language: 'english',
      phoneNumber: '1112223337',
      prefTime: 12.2,
      messagesSent: 0,
      responseCount: 0,
      reports: [],
      enabled: true,
    });

    await patient.save();
    const today = new Date();
    today.setSeconds(today.getSeconds() + 4);

    const message = new Message({
      phoneNumber: '0123454321',
      patientID: '60aebf123fbd20eba237244e',
      message: 'Test scheduled message',
      sender: 'GLUCOSE BOT',
      date: today,
      sent: false,
    });

    await message.save();
    const newSentMessage = await Message.findOne({ phoneNumber: '0123454321' });
    console.log(newSentMessage);
    done();
  });
});
