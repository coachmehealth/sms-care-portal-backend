import * as express from 'express';
import { CoachMeRequest } from '../types/coach_me_request';

export default (
  req: CoachMeRequest,
  res: express.Response,
  next: express.NextFunction,
) => {
  if (
    !req.secure &&
    req.get('x-forwarded-proto') !== 'https' &&
    process.env.NODE_ENV !== 'development'
  ) {
    return res.redirect(`https://${req.get('host')}${req.url}`);
  }
  return next();
};
