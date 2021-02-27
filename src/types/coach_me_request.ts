import express from 'express';

export type CoachMeRequest = express.Request & {
  userId?: string;
};
