const DATABASE_URI = process.env.DATABASE_URI || '';
const JWT_SECRET = process.env.JWT_SECRET || '';

// sendgrid configs
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const SENDGRID_EMAIL = 'hello@email.com';

export { DATABASE_URI, JWT_SECRET, SENDGRID_API_KEY, SENDGRID_EMAIL };
