import express from 'express';
import bodyParser from 'body-parser';
import twilio from 'twilio';
import { ObjectId } from 'mongodb';
import auth from '../../middleware/auth';
import { PatientForPhoneNumber } from '../../models/patient.model';
import { parseInboundPatientMessage } from '../../domain/message_parsing';
import { responseForParsedMessage } from '../../domain/glucose_reading_responses';
import { Outcome } from '../../models/outcome.model';
import { Message } from '../../models/message.model';
import errorHandler from '../error';

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));

const { MessagingResponse } = twilio.twiml;
const twiml = new MessagingResponse();

const UNRECOGNIZED_PATIENT_RESPONSE =
  'We do not recognize this number. Please contact CoachMe support.';

export const saveMessage = async (
  fromPhoneNumber: string,
  incoming: 'Glucose' | 'General',
  patientID: string,
  inboundMessage: string,
  date: Date,
  sender: string,
) => {
  const incomingMessage = new Message({
    sent: true,
    phoneNumber: fromPhoneNumber,
    patientID,
    message: inboundMessage,
    sender,
    date,
    isCoachingMessage: incoming === 'General',
  });

  await incomingMessage.save();
  return incomingMessage;
};

export const createNewOutcome = async (
  res: any,
  patientID: string,
  parsedResponse: any,
  fromPhoneNumber: string,
  inboundMessage: string,
  date: Date,
) => {
  try {
    if (parsedResponse.glucoseReading) {
      const outcome = new Outcome({
        phoneNumber: fromPhoneNumber,
        patientID,
        response: inboundMessage,
        value: parsedResponse.glucoseReading.score,
        alertType: parsedResponse.glucoseReading.classification,
        date,
      });

      await outcome.save();
    }
  } catch (e) {
    if (typeof e === 'string') {
      errorHandler(res, e);
    } else if (e instanceof Error) {
      errorHandler(res, e.message);
    }
  }
};

export const manageIncomingMessages = async (
  req: any,
  res: any,
  incoming: 'Glucose' | 'General',
) => {
  const inboundMessage = req.body.Body || 'Invalid Text (image)';
  const fromPhoneNumber = req.body.From.slice(2);
  const date = new Date();
  const patient = await PatientForPhoneNumber(fromPhoneNumber);
  if (!patient) {
    const twilioResponse = twiml.message(UNRECOGNIZED_PATIENT_RESPONSE);
    res.writeHead(204, { 'Content-Type': 'text/xml' });
    res.end(twilioResponse.toString());
    return;
  }

  const incomingMessage = await saveMessage(
    fromPhoneNumber,
    incoming,
    patient?._id,
    inboundMessage,
    date,
    'PATIENT',
  );

  if (incoming === 'General') {
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(incomingMessage?.sent.toString());
  }

  if (incoming === 'Glucose') {
    const parsedResponse = parseInboundPatientMessage(inboundMessage);
    await createNewOutcome(
      res,
      patient?._id,
      parsedResponse,
      fromPhoneNumber,
      inboundMessage,
      date,
    );

    const responseMessage = await responseForParsedMessage(
      parsedResponse,
      patient?.language,
    );

    await saveMessage(
      fromPhoneNumber,
      incoming,
      patient?._id,
      responseMessage,
      date,
      'BOT',
    );
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.message(responseMessage).toString());
  }
};

export const sendMessage = async (req: any, res: any) => {
  try {
    const recept = req.body.to;
    const patientID = new ObjectId(req.body.patientID);
    const date = new Date();
    const content = req.body.message;
    const outgoingMessage = new Message({
      sent: false,
      phoneNumber: recept,
      patientID,
      message: content,
      sender: 'COACH',
      date,
      isCoachingMessage: true,
    });

    await outgoingMessage.save();
    res.status(200).send({
      success: true,
      msg: outgoingMessage,
    });
  } catch (e) {
    if (typeof e === 'string') {
      errorHandler(res, e);
    } else if (e instanceof Error) {
      errorHandler(res, e.message);
    }
  }
};

router.post('/sendMessage', auth, async (req, res) => sendMessage(req, res));

router.post('/reply', async (req, res) =>
  manageIncomingMessages(req, res, 'Glucose'),
);

router.post('/receive', async (req, res) =>
  manageIncomingMessages(req, res, 'General'),
);

export default router;
