/* eslint-disable radix */
import express from 'express';
import { ObjectId } from 'mongodb';
import twilio from 'twilio';
import bodyParser from 'body-parser';

import { Message } from '../models/message.model';
import {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_FROM_NUMBER,
} from '../utils/config';

import { Outcome } from '../models/outcome.model';
import { PatientForPhoneNumber } from '../models/patient.model';
import auth from '../middleware/auth';
import { parseInboundPatientMessage } from '../domain/message_parsing';
import { responseForParsedMessage } from '../domain/glucose_reading_responses';

const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
const { MessagingResponse } = twilio.twiml;

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));

const UNRECOGNIZED_PATIENT_RESPONSE =
  'We do not recognize this number. Please contact CoachMe support.';

router.post('/sendMessage', auth, (req, res) => {
  const content = req.body.message;
  const recept = req.body.to;
  const patientID = new ObjectId(req.body.patientID);
  const date = new Date();

  twilioClient.messages.create({
    body: content,
    from: TWILIO_FROM_NUMBER,
    to: recept,
  });

  const outgoingMessage = new Message({
    sent: true,
    phoneNumber: TWILIO_FROM_NUMBER,
    patientID,
    message: content,
    sender: 'COACH',
    date,
  });

  outgoingMessage
    .save()
    .then(() => {
      res.status(200).send({
        success: true,
        msg: outgoingMessage,
      });
    })
    .catch((err) => console.log(err));
});

// this route receives and parses the message from one user, then responds accordingly with the appropriate output
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

export default router;
