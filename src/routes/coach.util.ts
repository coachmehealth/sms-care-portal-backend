import { sign, verify } from 'jsonwebtoken';
import * as _ from 'lodash';
import { Coach, ICoach } from '../models/coach.model';
import { JWT_SECRET } from '../utils/config';

class AuthError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

const generateAccessToken = (coach: ICoach): string =>
  sign(_.omit(coach.toObject(), 'password'), JWT_SECRET, {
    expiresIn: '5 m', // for testing purposes
  });

const generateRefreshToken = (coach: ICoach): any => {
  const refreshToken = sign({ type: 'refresh' }, JWT_SECRET, {
    expiresIn: '9999 years',
  });

  return Coach.findOneAndUpdate({ email: coach.email }, { refreshToken })
    .then(() => refreshToken)
    .catch((err) => {
      throw err;
    });
};

const validateRefreshToken = (refreshToken: string): Promise<any> =>
  new Promise((res, rej) => {
    verify(refreshToken, JWT_SECRET, (err) => {
      if (err) {
        rej(new AuthError('refreshExpired', 'Refresh token expired'));
      } else {
        Coach.findOne({ refreshToken })
          .then((coach) => {
            if (!coach) {
              rej(new AuthError('invalidToken', 'Refresh token invalid'));
            }
            res(coach);
          })
          .catch((e) => {
            rej(e);
          });
      }
    });
  });

export { generateAccessToken, generateRefreshToken, validateRefreshToken };
