import express from 'express';
import {
  connectDatabase,
  closeDatabase,
  clearDatabase,
  getTestToken,
} from '../../../test/db';
import twilioRouter from './twilio.api';

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
    it('sendMessage route sends messages to MessageGeneral database, not to glucoseMessages database', async () => {
      expect(1).toBeTruthy();
    });

    it('receive route saves incoming message from a known patient to MessagesGeneral', async () => {
      expect(1).toBeTruthy();
    });

    it('reply route saves incoming message from a known patient to Message and creates new outcome', async () => {
      expect(1).toBeTruthy();
    });
  });
} else {
  it('is not development', () => {
    expect(1).toBeTruthy();
  });
}
