import { ObjectId } from 'mongodb';
import { outreachMessage } from './outreachResponses';
import { connectDatabase, clearDatabse, closeDatabase } from '../../../test/db';
import { Message } from '../../models/message.model';
import { Patient, PatientForPhoneNumber } from '../../models/patient.model';

beforeAll(() => connectDatabase());
afterEach(() => clearDatabse());
afterAll(() => closeDatabase());

describe('Outreach tests', () => {
  it('Sends first outreach message', async () => {
    const newPatient = new Patient({
      firstName: 'Testing',
      lastName: 'Outreach',
      language: 'spanish',
      phoneNumber: '1234567891',
      reports: [],
      responseCount: 0,
      messagesSent: 0,
      coachID: new ObjectId('60ac2a4b01d7157738425701'),
      coachName: 'Jest Coach',
      enabled: true,
      prefTime: 10 * 60 + 20,
      clinic: 'Jest testing',
      outreach: {
        outreach: true,
        more: false,
        yes: false,
        lastMessageSent: '0',
        lastDate: new Date(),
      },
    });

    await newPatient.save();

    const patient = await PatientForPhoneNumber('1234567891');

    if (patient?.outreach.outreach) {
      await outreachMessage(patient);
    }

    const message = await Message.find({ phoneNumber: '1234567891' });
    expect(message[0]).toBeTruthy();
    expect(message.length === 4).toBeTruthy();
    expect(message[3].date > new Date()).toBeTruthy();
  });

  it('No user reply after outreach', async () => {
    const newPatient = new Patient({
      firstName: 'Testing',
      lastName: 'Outreach',
      language: 'spanish',
      phoneNumber: '1234567892',
      reports: [],
      responseCount: 0,
      messagesSent: 0,
      coachID: new ObjectId('60ac2a4b01d7157738425701'),
      coachName: 'Jest Coach',
      enabled: true,
      prefTime: 10 * 60 + 20,
      clinic: 'Jest testing',
      outreach: {
        outreach: true,
        more: false,
        yes: false,
        lastMessageSent: '1',
        lastDate: new Date(),
      },
    });

    await newPatient.save();

    const patient = await PatientForPhoneNumber('1234567892');

    if (patient?.outreach.outreach) {
      await outreachMessage(patient);
    }

    const message = await Message.find({ phoneNumber: '1234567892' });
    expect(message[0]).toBeFalsy();
  });

  it('User reply MORE after outreach', async () => {
    const newPatient = new Patient({
      firstName: 'Testing',
      lastName: 'Outreach',
      language: 'spanish',
      phoneNumber: '1234567892',
      reports: [],
      responseCount: 0,
      messagesSent: 0,
      coachID: new ObjectId('60ac2a4b01d7157738425701'),
      coachName: 'Jest Coach',
      enabled: true,
      prefTime: 10 * 60 + 20,
      clinic: 'Jest testing',
      outreach: {
        outreach: true,
        more: false,
        yes: false,
        lastMessageSent: '1',
        lastDate: new Date(),
      },
    });

    await newPatient.save();

    const patient = await PatientForPhoneNumber('1234567892');

    if (patient?.outreach.outreach) {
      await outreachMessage(patient, false, true);
    }

    const message = await Message.find({ phoneNumber: '1234567892' });
    expect(message[0]).toBeTruthy();
    expect(message.length === 5).toBeTruthy();
    expect(message[4].date > new Date()).toBeTruthy();
  });

  it('User reply YES after outreach', async () => {
    const newPatient = new Patient({
      firstName: 'Testing',
      lastName: 'Outreach',
      language: 'spanish',
      phoneNumber: '1234567893',
      reports: [],
      responseCount: 0,
      messagesSent: 0,
      coachID: new ObjectId('60ac2a4b01d7157738425701'),
      coachName: 'Jest Coach',
      enabled: true,
      prefTime: 10 * 60 + 20,
      clinic: 'Jest testing',
      outreach: {
        outreach: true,
        more: false,
        yes: false,
        lastMessageSent: '1',
        lastDate: new Date(),
      },
    });

    await newPatient.save();

    const patient = await PatientForPhoneNumber('1234567893');

    if (patient?.outreach.outreach) {
      await outreachMessage(patient, true, true);
    }

    const message = await Message.find({ phoneNumber: '1234567893' });
    expect(message[0]).toBeTruthy();
    expect(message.length === 1).toBeTruthy();
    expect(message[0].date > new Date()).toBeTruthy();
  });
});
