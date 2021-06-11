import { MessageGeneral } from '../../models/messageGeneral.model';
import { Message } from '../../models/message.model';
import {
  connectDatabase,
  clearDatabse,
  closeDatabase,
  getToken,
} from '../../../test/db';
import twilioRouter from './twilio.api';

const request = require('supertest');

const express = require('express');

const twilioApp = express();

twilioApp.use(express.urlencoded({ extended: false }));
twilioApp.use('/', twilioRouter);

const tokenObject = { token: [] };
beforeAll(async (done: any) => {
  await connectDatabase();
  await getToken(tokenObject, done);
});
afterEach(() => clearDatabse());
afterAll(() => closeDatabase());

describe('Twilio api properly receives messages', () => {
  test('sendMessage route sends messages to MessageGeneral database, not to glucoseMessages database', async (done) => {
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

    const messages = await MessageGeneral.find({});
    expect(messages.length).toBe(1);
    expect(messages[0].message).toBe('Test message');

    const glucoseMessages = await Message.find({});
    expect(glucoseMessages.length).toBe(0);

    done();
  });
});
