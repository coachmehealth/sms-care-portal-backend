export const DATABASE_URI = process.env.DATABASE_URI || '';
export const JWT_SECRET = process.env.JWT_SECRET || '';

// sendgrid configs
export const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
export const SENDGRID_EMAIL = 'hello@email.com';

export const parseTwilioFromNumber = (rawNumber: string | undefined) => {
  if (!rawNumber) {
    throw new Error('No TWILIO_FROM_NUMBER Found can not run server');
  }
  return rawNumber.replace(/[^0-9.]/g, '');
};

export const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;

export const TWILIO_FROM_NUMBER = parseTwilioFromNumber(
  process.env.TWILIO_FROM_NUMBER,
);
