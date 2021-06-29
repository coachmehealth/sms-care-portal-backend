import mongoose from 'mongoose';
import request from 'supertest';
import express from 'express';
import { hash } from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';
import { Coach } from '../src/models/coach.model';
import authRouter from '../src/routes/coach.auth';
import { DATABASE_URI } from '../src/utils/config';
import { IPatient, Patient } from '../src/models/patient.model';
import { Message } from '../src/models/message.model';
import { Outcome } from '../src/models/outcome.model';
import { MessageTemplate } from '../src/models/messageTemplate.model';

const authApp = express();

authApp.use(express.urlencoded({ extended: false }));
authApp.use('/', authRouter);

export const connectDatabase = async () => {
  await mongoose.connect(
    `${DATABASE_URI}-${uuidv4()}`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    },
    (err) => {
      if (err) {
        process.exit(1);
      }
    },
  );
};

export const clearDatabase = async () => {
  try {
    const collections = await mongoose.connection.collections;
    const collectionsKeys = Object.keys(collections);
    collectionsKeys.forEach(async (key: string) => {
      const collection = collections[key];
      await collection.deleteMany({});
    });
  } catch (error) {
    console.log('could not clear database', error);
  }
};

export const closeDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
};

export const getTestToken = async (tokenObj: any, done: any) => {
  // eslint-disable-next-line consistent-return
  hash('jest', 10, async (err, hashedPassword) => {
    if (err) {
      return err.message;
    }
    const newCoach = new Coach({
      firstName: 'jest',
      lastName: 'test',
      email: 'jest@test.net',
      password: hashedPassword,
    });
    await newCoach.save();
    const resp = await request(authApp).post('/login').type('form').send({
      email: 'jest@test.net',
      password: 'jest',
    });
    tokenObj.token.push(resp.body.accessToken);
    done();
  });
};

export const waitJest = async (waitTime: number) => {
  jest.useRealTimers();
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  await new Promise((resolve) => setTimeout(resolve, waitTime));
  jest.useFakeTimers();
};

export const createPatient = async (phoneNumber: string) => {
  const patient = new Patient({
    firstName: 'jest',
    lastName: 'jester',
    coachID: new ObjectId(1),
    coachName: 'jest coach',
    language: 'english',
    phoneNumber,
    prefTime: 12.2,
    messagesSent: 0,
    responseCount: 0,
    reports: [],
    enabled: true,
  });
  await patient.save();
};

export const createMessage = async (
  patient: IPatient,
  message: string,
  sent: boolean,
  sender: string,
  date: Date = new Date(),
) => {
  const newMessage = new Message({
    phoneNumber: patient.phoneNumber,
    patientID: patient._id,
    sender,
    message,
    date,
    sent,
    receivedWith: 'Glucose',
  });
  await newMessage.save();
};

export const createOutcome = async (
  patient: IPatient,
  date: Date,
  value: number,
  alertType: string,
) => {
  const newOutcome = new Outcome({
    patientID: patient._id,
    phoneNumber: patient.phoneNumber,
    date,
    response: `my glucose is ${value}`,
    value,
    alertType,
  });
  await newOutcome.save();
};

export const createMessageTemplate = async () => {
  const newMessageTemplate = new MessageTemplate({
    text: 'Health is fun!',
    language: 'english',
    type: 'Initial',
  });
  await newMessageTemplate.save();
};
