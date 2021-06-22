/* eslint-disable radix */
import express from 'express';
import { ObjectId } from 'mongodb';
import bodyParser from 'body-parser';
import auth from '../../middleware/auth';
import manageIncomingMessages from './twilio.functions';
import { Message } from '../../models/message.model';

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));

const UNRECOGNIZED_PATIENT_RESPONSE =
  'We do not recognize this number. Please contact CoachMe support.';

router.post('/sendMessage', auth, (req, res) => {
  const content = req.body.message;
  const recept = req.body.to;
  const patientID = new ObjectId(req.body.patientID);
  const date = new Date();

  const outgoingMessage = new Message({
    sent: false,
    phoneNumber: recept,
    patientID,
    message: content,
    sender: 'COACH',
    date,
    isGeneralNumber: true,
  });

  outgoingMessage
    .save()
    .then(() => {
      res.status(200).send({
        success: true,
        msg: outgoingMessage,
      });
    })
    // eslint-disable-next-line no-console
    .catch((err) => console.log(err));
});

router.post('/reply', async (req, res) =>
  manageIncomingMessages(req, res, UNRECOGNIZED_PATIENT_RESPONSE, 'Glucose'),
);

router.post('/receive', async (req, res) =>
  manageIncomingMessages(req, res, UNRECOGNIZED_PATIENT_RESPONSE, 'General'),
);

export default router;
