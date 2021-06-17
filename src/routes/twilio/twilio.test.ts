import {
  TWILIO_FROM_NUMBER,
  TWILIO_FROM_NUMBER_GENERAL,
} from '../../utils/config';

describe('Twilio tests', () => {
  it('Expect TWILIO_FROM_NUMBER and TWILIO_FROM_NUMBER_GENERAL to exist and be different', () => {
    expect(TWILIO_FROM_NUMBER !== TWILIO_FROM_NUMBER_GENERAL).toBeTruthy();
  });
});
