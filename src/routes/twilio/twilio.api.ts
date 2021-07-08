import express from 'express';
import bodyParser from 'body-parser';
import auth from '../../middleware/auth';
import { manageIncomingMessages, sendMessage } from './twilio.functions';

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));

router.post('/sendMessage', auth, (req, res) => sendMessage(req, res));

// this route receives and parses the message from one user, then responds accordingly with the appropriate output
router.post('/reply', async (req, res) => manageIncomingMessages(req, res));

export default router;
