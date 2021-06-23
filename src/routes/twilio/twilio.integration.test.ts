import request from 'supertest';
import express from 'express';
import {
  connectDatabase,
  closeDatabase,
  clearDatabase,
  getTestToken,
  createPatient,
} from '../../../test/db';
import twilioRouter from './twilio.api';
import { Patient } from '../../models/patient.model';
import { Message } from '../../models/message.model';
import { Outcome } from '../../models/outcome.model';
import { Patient } from '../../models/patient.model';

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

  describe('Twilio api integration properly handles messages', () => {
    it('sendMessage route saves message with sender COACH and isGeneralNumber false ', async () => {
      const res = await request(twilioApp)
        .post('/sendMessage')
        .set('Authorization', `Bearer ${tokenObject.token[0]}`)
        .type('form')
        .send({
          message: 'Test message',
          to: 'test number',
          patientID: '60aebf123fbd20eba237244e',
        });
      expect(res.statusCode).toBe(200);
      const message = await Message.findOne();
      expect(message?.sender).toBe('COACH');
      expect(message?.isGeneralNumber).toBe(true);
    });

    it('receive route saves incoming message from a known patient to Message database with General number', async () => {
      await createPatient('1114446668');
      const patient = await Patient.findOne();
      const res = await request(twilioApp)
        .post('/receive')
        .set('Authorization', `Bearer ${tokenObject.token[0]}`)
        .type('form')
        .send({
          Body: 'Test message',
          From: '001114446668',
          patientID: `${patient?._id}`,
        });
      expect(res.statusCode).toBe(200);
      const messages = await Message.findOne();
      expect(messages?.isGeneralNumber).toBe(true);
      expect(messages?.sender).toBe('PATIENT');
    });

    it('reply route saves incoming message from a known patient to Message and creates new outcome', async () => {
      await createPatient('1114446668');
      const patient = await Patient.findOne();
      const res = await request(twilioApp)
        .post('/reply')
        .set('Authorization', `Bearer ${tokenObject.token[0]}`)
        .type('form')
        .send({
          Body: 'Test message 88',
          From: '001114446668',
          patientID: `${patient?._id}`,
        });
      expect(res.statusCode).toBe(200);
      const messages = await Message.find();
      const outcome = await Outcome.find();
      expect(messages[0]?.isGeneralNumber).toBe(false);
      expect(messages[0]?.sender).toBe('PATIENT');
      expect(messages[1]?.isGeneralNumber).toBe(false);
      expect(messages[1]?.sender).toBe('BOT');
      expect(outcome.length).toBe(1);
      expect(outcome[0].phoneNumber).toBe('1114446668');
    });
  });

  describe('User Model Test', () => {
    it('Send an scheduled message', async () => {
      await createPatient('1112223337');
      const patient = await Patient.findOne({ phoneNumber: '1112223337' });
      const res = await request(twilioApp)
        .post('/sendMessage')
        .set('Authorization', `Bearer ${tokenObject.token[0]}`)
        .type('form')
        .send({
          message: 'jest message',
          to: '1112223337',
          patientID: patient?._id,
          scheduled: 'Fri Jun 04 2221 14:14:51',
          phoneNumber: '12312038',
          sender: 'BOT',
          sent: false,
        });
      expect(res.statusCode).toBe(200);
      const messages = await Message.find();
      const messagesGeneral = await MessageGeneral.find();
      expect(messages.length).toBe(0);
      expect(messagesGeneral.length).toBe(1);
      expect(
        messagesGeneral[0].date > new Date('Thu Feb 01 2221 00:00:00'),
      ).toBeTruthy();
    });

    it('Send an unscheduled message', async () => {
      await createPatient('1112223337');
      const patient = await Patient.findOne({ phoneNumber: '1112223337' });
      const res = await request(twilioApp)
        .post('/sendMessage')
        .set('Authorization', `Bearer ${tokenObject.token[0]}`)
        .type('form')
        .send({
          message: 'jest message',
          to: '1112223337',
          patientID: patient?._id,
          scheduled: '',
          phoneNumber: '12312038',
          sender: 'BOT',
          sent: false,
        });
      expect(res.statusCode).toBe(200);
      const messages = await Message.find();
      const messagesGeneral = await MessageGeneral.find();
      expect(messages.length).toBe(0);
      expect(messagesGeneral.length).toBe(1);
    });
  });
} else {
  it('is not development', () => {
    expect(1).toBeTruthy();
  });
}
