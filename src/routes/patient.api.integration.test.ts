import request from 'supertest';
import express from 'express';
import {
  connectDatabase,
  closeDatabase,
  clearDatabase,
  getTestToken,
  createPatient,
} from '../../test/db';
import patientRouter from './patient.api';
import { Patient } from '../models/patient.model';

const patientApp = express();

patientApp.use(express.json());
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

  describe('Patient api updates outreach properly', () => {
    it('patient outreach is updated when an /updateOureach request is received', async () => {
      await createPatient('1123412312');
      const patient = await Patient.findOne({ phoneNumber: '1123412312' });
      const res = await request(patientApp)
        .post('/updateOutreach')
        .set('Authorization', `Bearer ${tokenObject.token[0]}`)
        .send({
          patientID: patient?._id,
          outreach: {
            outreach: true,
            yes: false,
            complete: false,
            lastMessageSent: '0',
            lastDate: new Date(),
          },
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json');
      expect(res.statusCode).toBe(200);
      const modifiedPatient = await Patient.findOne();
      expect(modifiedPatient?.outreach.outreach).toBeTruthy();
      expect(modifiedPatient?.outreach.lastMessageSent).toBe('0');
    });
  });
} else {
  it('is not development', () => {
    expect(1).toBeTruthy();
  });
}
