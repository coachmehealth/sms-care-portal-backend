import {
  connectDatabase,
  closeDatabase,
  waitJest,
  createPatient,
  createMessage,
} from '../../test/db';
import { Message } from '../models/message.model';
import { Patient } from '../models/patient.model';
import initializeScheduler from './scheduling';

if (process.env.NODE_ENV === 'development') {
  beforeAll(() => connectDatabase());
  afterAll(() => closeDatabase());

  const patientPhone = '12';

  describe('Scheduling tests', () => {
    jest.useFakeTimers();
    it('sends scheduled messages', async (done) => {
      await createPatient(patientPhone);
      const patient = await Patient.findOne();
      if (patient) {
        await createMessage(patient, 'Test scheduled message', false, 'BOT');
      }

      const msgbefore = await Message.findOne({ phoneNumber: patientPhone });
      expect(msgbefore?.sent).toBeFalsy();
      initializeScheduler();
      await waitJest(100);
      const msgafter = await Message.findOne({ phoneNumber: patientPhone });
      expect(msgafter?.sent).toBeTruthy();
      done();
    });
  });
} else {
  it('is not development', () => {
    expect(1).toBeTruthy();
  });
}
