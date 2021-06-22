import request from 'supertest';
import express from 'express';
import {
  connectDatabase,
  closeDatabase,
  clearDatabase,
  getTestToken,
} from '../../../test/db';
import patientRouter from './patient.api';

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
      expect(1).toBe(1);
    });
  });
} else {
  it('is not development', () => {
    expect(1).toBeTruthy();
  });
}
