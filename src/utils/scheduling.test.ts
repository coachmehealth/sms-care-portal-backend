import { getTwilioNumber } from './scheduling';
import { TWILIO_FROM_NUMBER, TWILIO_FROM_NUMBER_GENERAL } from './config';

jest.mock('twilio');

describe('Scheduling tests', () => {
  it('Expect message to use TWILIO_FROM_NUMBER_GENERAL when isMessageGeneral is true', async () => {
    expect(getTwilioNumber(true)).toBe(TWILIO_FROM_NUMBER_GENERAL);
  });
  it('Expect message to use TWILIO_FROM_NUMBER_GENERAL when isMessageGeneral is false', async () => {
    expect(getTwilioNumber(false)).toBe(TWILIO_FROM_NUMBER);
  });
});
