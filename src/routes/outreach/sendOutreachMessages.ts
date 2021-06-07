import { ObjectId } from 'mongodb';
import twilio from 'twilio';
import {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_FROM_NUMBER,
} from '../../utils/config';
import { Message } from '../../models/message.model';

const sendOutreachMessage = async (message_id: string, recept: string) => {
  const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

  

  twilioClient.messages.create({
    body: content,
    from: TWILIO_FROM_NUMBER,
    to: recept,
  });




};

export default sendOutreachMessage;
