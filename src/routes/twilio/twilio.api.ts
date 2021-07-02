import express from 'express';
import bodyParser from 'body-parser';
import auth from '../../middleware/auth';
import { manageIncomingMessages, sendMessage } from './twilio.functions';

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));

const UNRECOGNIZED_PATIENT_RESPONSE =
  'We do not recognize this number. Please contact CoachMe support.';

router.post('/sendMessage', auth, async (req, res) => sendMessage(req, res));

router.post('/reply', async (req, res) =>
  manageIncomingMessages(req, res, UNRECOGNIZED_PATIENT_RESPONSE, 'Glucose'),
);

router.post('/receive', async (req, res) =>
  manageIncomingMessages(req, res, UNRECOGNIZED_PATIENT_RESPONSE, 'General'),
);

export default router;
