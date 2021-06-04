import { Message } from '../../models/message.model';
import { connectDatabase, clearDatabse, closeDatabase } from '../../../test/db';
import sendMessage from './twilio.functions';

beforeAll(() => connectDatabase());
afterEach(() => clearDatabse());
afterAll(() => closeDatabase());

describe('User Model Test', () => {
  const res = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    status(num: any) {
      return {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        send({ msg, success }: any) {},
      };
    },
  };
  it('Send an unscheduled message', async () => {
    const scheduled = '';
    const req = {
      body: {
        message: 'jest message',
        to: '123456788',
        patientID: '60ac2ce001d7157738425701',
        scheduled,
        phoneNumber: '12312038',
        sender: 'BOT',
        sent: false,
      },
    };
    await sendMessage(req, res);
    const message = await Message.findOne({ message: req.body.message });
    expect(message).toBeTruthy();

    const todayPlusOneHour = new Date();
    todayPlusOneHour.setHours(todayPlusOneHour.getHours() + 1);
    if (message?.date) {
      expect(message.date < todayPlusOneHour);
    }
  });

  it('Send an scheduled message', async () => {
    const scheduled =
      'Fri Jun 04 2221 14:14:51 GMT-0500 (Central Daylight Time)';
    const req = {
      body: {
        message: 'jest message',
        to: '123456788',
        patientID: '60ac2ce001d7157738425701',
        scheduled,
        phoneNumber: '12312038',
        sender: 'BOT',
        sent: false,
      },
    };
    await sendMessage(req, res);
    const message = await Message.findOne({ message: req.body.message });
    expect(message).toBeTruthy();

    if (message?.date) {
      expect(message.date > new Date()).toBeTruthy();
    }
  });
});
