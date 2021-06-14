import request from 'supertest';
import express from 'express';
import { MessageGeneral } from '../../models/messageGeneral.model';
import { Message } from '../../models/message.model';
import { connectDatabase, closeDatabase, getToken } from '../../../test/db';
import twilioRouter from './twilio.api';
import { Patient } from '../../models/patient.model';
import { Coach } from '../../models/coach.model';
import { Outcome } from '../../models/outcome.model';

const twilioApp = express();

twilioApp.use(express.urlencoded({ extended: false }));
twilioApp.use('/', twilioRouter);

const tokenObject = { token: [] };
beforeAll(async (done: any) => {
  await connectDatabase();
  await getToken(tokenObject, done);
});
afterAll(() => closeDatabase());

describe('Twilio api properly receives messages', () => {
  it('sendMessage route sends messages to MessageGeneral database, not to glucoseMessages database', async () => {
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

    const messages = await MessageGeneral.findOne({ message: 'Test message' });
    expect(messages).toBeTruthy();

    const glucoseMessages = await Message.find({});
    expect(glucoseMessages.length).toBe(0);
  });

  it('receive route saves incoming message from a known patient to MessagesGeneral', async (done) => {
    const coach = await Coach.find({});
    await new Patient({
      firstName: 'jest',
      lastName: 'jester',
      coachID: coach[0]._id,
      coachName: coach[0].firstName,
      language: 'english',
      phoneNumber: '1112223337',
      prefTime: 12.2,
      messagesSent: 0,
      responseCount: 0,
      reports: [],
      enabled: true,
    }).save();

    const res = await request(twilioApp).post('/receive').type('form').send({
      Body: 'receive message',
      From: '011112223337',
    });
    expect(res.statusCode).toBe(200);

    const messages = await MessageGeneral.findOne({
      message: 'receive message',
    });
    expect(messages).toBeTruthy();
    const glucoseMessages = await Message.find({});
    expect(glucoseMessages.length).toBe(0);
    done();
  });

  it('reply route saves incoming message from a known patient to Message and creates new outcome', async (done) => {
    const generalMessages = await MessageGeneral.find({});
    const res = await request(twilioApp).post('/reply').type('form').send({
      Body: 'My glucose is 101',
      From: '011112223337',
    });
    expect(res.statusCode).toBe(200);

    const messages = await Message.findOne({ message: 'My glucose is 101' });
    expect(messages).toBeTruthy();
    const newGeneralMessages = await MessageGeneral.find({});
    expect(newGeneralMessages.length === generalMessages.length).toBeTruthy();

    const outcomes = await Outcome.find({});
    expect(outcomes[0].value).toBe(101);
    expect(outcomes[0].response).toBe('My glucose is 101');

    done();
  });
});
