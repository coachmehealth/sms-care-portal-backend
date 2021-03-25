import express from 'express';
import twilio from 'twilio';
import { TWILIO_AUTH_TOKEN } from '../utils/config';
import { CoachMeRequest } from '../types/coach_me_request';

export default (
  req: CoachMeRequest,
  res: express.Response,
  next: express.NextFunction,
) => {
  const authToken = TWILIO_AUTH_TOKEN || '';
  const twilioSignature = req.get('X-Twilio-Signature') || '';
  const url = `https://${req.get('host')}${req.originalUrl}`;
  const params = req.body;
  const requestIsSigned = twilio.validateRequest(
    authToken,
    twilioSignature,
    url,
    params,
  );

  if (!requestIsSigned) {
    return res.status(401).json({
      msg: 'Unable to ensure the Twilio request is authentic.',
    });
  }
  return next();
};
