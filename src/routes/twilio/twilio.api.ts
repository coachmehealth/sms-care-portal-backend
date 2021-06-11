/* eslint-disable radix */
import express from 'express';
import { ObjectId } from 'mongodb';
import twilio from 'twilio';
import bodyParser from 'body-parser';
import {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_FROM_NUMBER_GENERAL,
} from '../../utils/config';
import auth from '../../middleware/auth';
import manageIncomingMessages from './twilio.functions';
import { MessageGeneral } from '../../models/messageGeneral.model';

const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

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
    from: TWILIO_FROM_NUMBER_GENERAL,
    to: recept,
  });

  const outgoingMessage = new MessageGeneral({
    sent: true,
    phoneNumber: TWILIO_FROM_NUMBER_GENERAL,
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

// this route receives and parses the message from one user, then responds accordingly with the appropriate output.
// This route is used for the glucose tracker.
router.post('/reply', async (req, res) =>
  manageIncomingMessages(req, res, UNRECOGNIZED_PATIENT_RESPONSE, 'Glucose'),
);

router.post('/receive', async (req, res) =>
  manageIncomingMessages(req, res, UNRECOGNIZED_PATIENT_RESPONSE, 'General'),
);

export default router;
