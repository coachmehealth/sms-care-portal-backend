/* eslint-disable radix */
import express from 'express';
import bodyParser from 'body-parser';
import twilio from 'twilio';
import { Outcome } from '../../models/outcome.model';
import { PatientForPhoneNumber } from '../../models/patient.model';
import auth from '../../middleware/auth';
import { parseInboundPatientMessage } from '../../domain/message_parsing';
import { responseForParsedMessage } from '../../domain/glucose_reading_responses';
import sendMessage from './twilio.functions';

import { Message } from '../../models/message.model';

const { MessagingResponse } = twilio.twiml;

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));

const UNRECOGNIZED_PATIENT_RESPONSE =
  'We do not recognize this number. Please contact CoachMe support.';

router.post('/sendMessage', auth, [sendMessage]);

// this route receives and parses the message from one user, then responds accordingly with the appropriate output.
// This route is used for the glucose tracker.
router.post('/reply', async (req, res) => {
  const twiml = new MessagingResponse();

  const inboundMessage = req.body.Body || 'Invalid Text (image)';
  const fromPhoneNumber = req.body.From.slice(2);
  const date = new Date();

  const patient = await PatientForPhoneNumber(fromPhoneNumber);

  if (!patient) {
    const twilioResponse = twiml.message(UNRECOGNIZED_PATIENT_RESPONSE);

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twilioResponse.toString());
    return;
  }

  const incomingMessage = new Message({
    sent: true,
    phoneNumber: req.body.From,
    patientID: patient._id,
    message: inboundMessage,
    receivedWith: 'Glucose',
    sender: 'PATIENT',
    date,
  });

  await incomingMessage.save();

  const parsedResponse = parseInboundPatientMessage(inboundMessage);

  if (parsedResponse.glucoseReading) {
    const outcome = new Outcome({
      phoneNumber: fromPhoneNumber,
      patientID: patient._id,
      response: inboundMessage,
      value: parsedResponse.glucoseReading.score,
      alertType: parsedResponse.glucoseReading.classification,
      date,
    });

    await outcome.save();
  }

  const responseMessage = await responseForParsedMessage(
    parsedResponse,
    patient.language,
  );

  const outgoingMessage = new Message({
    sent: true,
    phoneNumber: fromPhoneNumber,
    patientID: patient._id, // lost on this
    message: responseMessage,
    sender: 'BOT',
    date,
  });

  await outgoingMessage.save();

  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.message(responseMessage).toString());
});

// this route receives and parses the message from one user, then responds accordingly with the appropriate output.
// This route is used for messages other than glucose tracker.
router.post('/receive', async (req, res) => {
  const twiml = new MessagingResponse();

  const inboundMessage = req.body.Body || 'Invalid Text (image)';
  const fromPhoneNumber = req.body.From.slice(2);
  const date = new Date();

  const patient = await PatientForPhoneNumber(fromPhoneNumber);

  if (!patient) {
    const twilioResponse = twiml.message(UNRECOGNIZED_PATIENT_RESPONSE);

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twilioResponse.toString());
    return;
  }

  const incomingMessage = new Message({
    sent: true,
    phoneNumber: req.body.From,
    patientID: patient._id,
    message: inboundMessage,
    sender: 'PATIENT',
    receivedWith: 'Outreach',
    date,
  });

  await incomingMessage.save();

  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end();
});

export default router;
