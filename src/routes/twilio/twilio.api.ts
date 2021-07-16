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

export const saveMessage = async ({
  fromPhoneNumber,
  incoming,
  patientID,
  message,
  date,
  sender,
}: {
  fromPhoneNumber: string;
  incoming: boolean;
  patientID: string;
  message: string;
  date: Date;
  sender: string;
}) => {
  const incomingMessage = new Message({
    sent: true,
    phoneNumber: fromPhoneNumber,
    patientID,
    message,
    sender,
    date,
    isCoachingMessage: incoming,
  });

  await incomingMessage.save();
  return incomingMessage;
};

export const createNewOutcome = async ({
  res,
  patientID,
  parsedResponse,
  fromPhoneNumber,
  message,
  date,
}: {
  res: any;
  patientID: string;
  parsedResponse: any;
  fromPhoneNumber: string;
  message: string;
  date: Date;
}) => {
  try {
    if (parsedResponse.glucoseReading) {
      const outcome = new Outcome({
        phoneNumber: fromPhoneNumber,
        patientID,
        response: message,
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

export const manageGlucoseMessages = async ({
  res,
  inboundMessage,
  patientID,
  fromPhoneNumber,
  date,
  patientLanguage,
  incoming,
}: {
  res: any;
  inboundMessage: string;
  patientID: string;
  fromPhoneNumber: string;
  date: Date;
  patientLanguage: string;
  incoming: boolean;
}) => {
  const parsedResponse = parseInboundPatientMessage(inboundMessage);
  await createNewOutcome({
    res,
    patientID,
    parsedResponse,
    fromPhoneNumber,
    message: inboundMessage,
    date,
  });

  const responseMessage = await responseForParsedMessage(
    parsedResponse,
    patientLanguage,
  );

  await saveMessage({
    fromPhoneNumber,
    incoming,
    patientID,
    message: responseMessage,
    date,
    sender: 'BOT',
  });
  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.message(responseMessage).toString());
};

export const manageIncomingMessages = async ({
  req,
  res,
  incoming,
}: {
  req: any;
  res: any;
  incoming: boolean;
}) => {
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
  const patientID = patient?._id;

  const incomingMessage = await saveMessage({
    fromPhoneNumber,
    incoming,
    patientID,
    message: inboundMessage,
    date,
    sender: 'PATIENT',
  });

  if (incoming) {
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(incomingMessage?.sent.toString());
    return;
  }

  if (!incoming) {
    manageGlucoseMessages({
      res,
      inboundMessage,
      patientID,
      fromPhoneNumber,
      date,
      patientLanguage: patient.language,
      incoming,
    });
  }
};

router.post('/sendMessage', auth, async (req, res) => {
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
});

router.post('/reply', async (req, res) =>
  manageIncomingMessages({ req, res, incoming: false }),
);

router.post('/receive', async (req, res) =>
  manageIncomingMessages({ req, res, incoming: true }),
);

export default router;
