import request from 'supertest';
import express from 'express';
import {
  connectDatabase,
  closeDatabase,
  clearDatabase,
  waitJest,
  createCoach,
  getTestToken,
  createPatient,
} from '../../../test/db';
import patientRouter from '../patient.api';
import twilioRouter from '../twilio/twilio.api';
import { Patient } from '../../models/patient.model';
import { outreachNoResponseSendNextMessage } from '../../background_jobs/utils';
import { Message } from '../../models/message.model';

const patientApp = express();
patientApp.use(express.json());
patientApp.use(express.urlencoded({ extended: false }));
patientApp.use('/', patientRouter);

const twilioApp = express();

twilioApp.use(express.urlencoded({ extended: false }));
twilioApp.use('/', twilioRouter);

if (process.env.NODE_ENV === 'development') {
  const tokenObject = { token: [] };
  beforeAll(async (done: any) => {
    await connectDatabase();
    await getTestToken(tokenObject, done);
  });
  beforeEach(async () => clearDatabase());
  afterAll(() => closeDatabase());

  describe('Outreach logic tests', () => {
    jest.useFakeTimers();
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);
    it('Sends an outreach message when a patient is created and outreach is turned on', async () => {
      await createCoach();
      const res = await request(patientApp)
        .post('/add')
        .set('Authorization', `Bearer ${tokenObject.token[0]}`)
        .send({
          firstName: 'outreach test',
          lastName: 'test',
          language: 'english',
          phoneNumber: '6722333522',
          coachId: '60ac2a4b01d7157738425700',
          isEnabled: true,
          msgTime: '13:33',
          coachName: 'Test Testingson',
          clinic: 'Call me coahc',
          outreach: {
            outreach: true,
            yes: false,
            complete: false,
          },
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json');

      expect(res.statusCode).toBe(200);
      await waitJest(500);
      const messages = await Message.find();
      expect(messages[0].message).toBe(
        'Hi outreach test, your team at Call me coahc 🏥 referred you to join the Healthy At Home Program. This is Test Testingson and I can tell you more.',
      );
      expect(messages[3].message).toBe(
        'Want to join for FREE? Respond YES to get set up with your diabetes coach or MORE to learn more.',
      );
      expect(messages.length).toBe(4);
      expect(messages[2].isGeneralNumber).toBeTruthy();
      const updatedPatient = await Patient.findOne();
      expect(updatedPatient?.outreach.lastMessageSent).toBe('1');
      expect(updatedPatient?.outreach.outreach).toBe(true);
      expect(updatedPatient?.outreach.yes).toBe(false);
      expect(updatedPatient?.outreach.complete).toBe(false);
    });
    it('sends next batch of messages if no message is received in 24 hours', async () => {
      const outreachData = {
        outreach: true,
        yes: false,
        complete: false,
        lastMessageSent: '1',
        lastDate: yesterday,
      };
      await createPatient('6722337122', outreachData);
      await createPatient('6722337127');
      await createPatient('6722337124', outreachData);
      await outreachNoResponseSendNextMessage();
      await waitJest(100);
      const updatedPatient = await Patient.findOne({
        phoneNumber: '6722337122',
      });
      expect(updatedPatient?.outreach.lastMessageSent).toBe('2');
      expect(
        (updatedPatient?.outreach.lastDate.getDay() || yesterday.getDay()) -
          yesterday.getDay(),
      ).toBe(1);
      expect(updatedPatient?.outreach.outreach).toBe(true);
      expect(updatedPatient?.outreach.yes).toBe(false);
      expect(updatedPatient?.outreach.complete).toBe(false);

      const messages = await Message.find();
      expect(messages[0].message).toBe(
        'Great! We’ve helped people like you manage their diabetes at home. See for yourself:',
      );
      expect(messages[0].isGeneralNumber).toBeTruthy();
      expect(messages.length).toBe(10);
    });

    it('sends automatic yes message if patient does not answer MORE or in 3 days.', async () => {
      const outreachData = {
        outreach: true,
        yes: false,
        complete: false,
        lastMessageSent: '3',
        lastDate: yesterday,
      };
      await createPatient('6722337122', outreachData);
      await outreachNoResponseSendNextMessage();
      await waitJest(100);
      const updatedPatient = await Patient.findOne({
        phoneNumber: '6722337122',
      });
      expect(updatedPatient?.outreach.lastMessageSent).toBe('yes');
      expect(
        (updatedPatient?.outreach.lastDate.getDay() || yesterday.getDay()) -
          yesterday.getDay(),
      ).toBe(1);
      expect(updatedPatient?.outreach.outreach).toBe(true);
      expect(updatedPatient?.outreach.yes).toBe(true);
      expect(updatedPatient?.outreach.complete).toBe(false);

      const message = await Message.find();
      expect(message[0].message).toBe(
        'Welcome to Healthy at Home! By joining, you’ve taken step 1️⃣ for your health. 💪',
      );
      expect(message.length).toBe(1);
      expect(message[0].isGeneralNumber).toBeTruthy();
    });

    it('sends proper messages if MORE is received ', async () => {
      const outreachData = {
        outreach: true,
        yes: false,
        complete: false,
        lastMessageSent: '2',
        lastDate: new Date(),
      };
      await createPatient('7773332221', outreachData);
      const res = await request(twilioApp).post('/receive').type('form').send({
        Body: 'Hey! I want MORE messages',
        From: '017773332221',
      });
      expect(res.statusCode).toBe(200);
      await waitJest(100);
      const messages = await Message.find();
      expect(messages.length).toBe(4);
      expect(messages[0].isGeneralNumber).toBeTruthy();
      const updatedPatient = await Patient.findOne();
      expect(updatedPatient?.outreach.lastMessageSent).toBe('3');
      expect(updatedPatient?.outreach.outreach).toBe(true);
      expect(updatedPatient?.outreach.yes).toBe(false);
      expect(updatedPatient?.outreach.complete).toBe(false);
    });

    it('sends proper messages if YES is received ', async () => {
      const outreachData = {
        outreach: true,
        yes: false,
        complete: false,
        lastMessageSent: '1',
        lastDate: new Date(),
      };
      await createPatient('7773332221', outreachData);
      const res = await request(twilioApp).post('/receive').type('form').send({
        Body: 'Hey! I want IN, YES',
        From: '017773332221',
      });
      expect(res.statusCode).toBe(200);
      await waitJest(100);
      const messages = await Message.find();
      expect(messages.length).toBe(2);
      expect(messages[1].isGeneralNumber).toBeTruthy();
      const updatedPatient = await Patient.findOne();
      expect(updatedPatient?.outreach.lastMessageSent).toBe('yes');
      expect(updatedPatient?.outreach.outreach).toBe(true);
      expect(updatedPatient?.outreach.yes).toBe(true);
      expect(updatedPatient?.outreach.complete).toBe(false);
    });
  });
} else {
  it('backgroundJobs', () => {
    expect(1).toBeTruthy();
  });
}
