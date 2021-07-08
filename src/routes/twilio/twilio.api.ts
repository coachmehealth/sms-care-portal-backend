import express from 'express';
import bodyParser from 'body-parser';
import auth from '../../middleware/auth';
import { manageIncomingMessages, sendMessage } from './twilio.functions';

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));

router.post('/sendMessage', auth, async (req, res) => sendMessage(req, res));

router.post('/reply', async (req, res) =>
  manageIncomingMessages(req, res, 'Glucose'),
);

router.post('/receive', async (req, res) =>
  manageIncomingMessages(req, res, 'General'),
);

export default router;
