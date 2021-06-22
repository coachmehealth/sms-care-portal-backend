import request from 'supertest';
import express from 'express';
import {
  connectDatabase,
  closeDatabase,
  clearDatabase,
  getTestToken,
  createPatient,
  createMessage,
  createMessageGeneral,
} from '../../../test/db';
import patientRouter from './patient.api';
import { Patient } from '../../models/patient.model';

const patientApp = express();

patientApp.use(express.urlencoded({ extended: false }));
patientApp.use('/', patientRouter);

if (process.env.NODE_ENV === 'development') {
  const tokenObject = { token: [] };
  beforeAll(async (done: any) => {
    await connectDatabase();
    await getTestToken(tokenObject, done);
  });
  beforeEach(async () => clearDatabase());
  afterAll(() => closeDatabase());

  describe('patient.api tests', () => {
    it('getPatientMessages gets all messages from a user (Glucose and General)', async () => {
      await createPatient('111');
      const patient = await Patient.findOne({});
      if (patient) {
        await createMessage(patient, 'My glucose is 96', true, 'PATIENT');
        await createMessage(patient, 'bot unsentmessage', false, 'BOT');
        await createMessageGeneral(patient, 'You are well!', true, 'COACH');
        await createMessageGeneral(patient, 'Unsent message', false, 'COACH');
      }

      const res = await request(patientApp)
        .get(`/getPatientMessages/${patient?._id}`)
        .set('Authorization', `Bearer ${tokenObject.token[0]}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0].receivedWith).toBe('General');
      expect(res.body[1].receivedWith).toBe('Glucose');
    });
  });
} else {
  it('is not development', () => {
    expect(1).toBeTruthy();
  });
}
