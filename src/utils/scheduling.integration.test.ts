import {
  connectDatabase,
  closeDatabase,
  createPatient,
  createMessage,
  waitJest,
} from '../../test/db';
import { Patient } from '../models/patient.model';
import { Message } from '../models/message.model';
import initializeScheduler from './scheduling';

if (process.env.NODE_ENV === 'development') {
  beforeAll(() => connectDatabase());
  afterAll(() => closeDatabase());

  describe('Scheduling tests', () => {
    jest.useFakeTimers();
    it('sends scheduled messages', async () => {
      await createPatient('11112');
      const patient = await Patient.findOne();
      if (patient) {
        await createMessage(patient, 'I scheduled this message', false, 'BOT');
      }
      const msgbefore = await Message.findOne();
      expect(msgbefore?.sent).toBeFalsy();
      initializeScheduler();
      await waitJest(300);
      const msgafter = await Message.findOne({ phoneNumber: '11112' });
      expect(msgafter?.sent).toBeTruthy();
    });
  });
} else {
  it('is not development', () => {
    expect(1).toBeTruthy();
  });
}
