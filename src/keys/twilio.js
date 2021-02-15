"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.twilioNumber = exports.authToken = exports.accountSid = void 0;
var accountSid = process.env.TWILIO_ACCOUNT_SID;
exports.accountSid = accountSid;
var authToken = process.env.TWILIO_AUTH_TOKEN;
exports.authToken = authToken;
var twilioNumber = process.env.TWILIO_PHONE_NUMBER;
exports.twilioNumber = twilioNumber;
