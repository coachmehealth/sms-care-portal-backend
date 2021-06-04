import {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_FROM_NUMBER,
} from '../../utils/config';
import { ObjectId } from 'mongodb';
import twilio from 'twilio';
import { Message } from '../../models/message.model';

const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

export const sendMessage = async (req: any, res: any) => {
  const content = req.body.message;
  const recept = req.body.to;
  const patientID = new ObjectId(req.body.patientID);
  const scheduled = req.body.scheduled;
  const date = scheduled === '' ? new Date() : new Date(scheduled);

  if (scheduled === '') {
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

    await outgoingMessage
      .save()
      .then(async () => {
        res.status(200).send({
          success: true,
          msg: outgoingMessage,
        });
      })
      .catch((err) => console.log(err));
  } else {
    //Schedule message
    const outgoingMessage = new Message({
      sent: false,
      phoneNumber: TWILIO_FROM_NUMBER,
      patientID,
      message: content,
      sender: 'COACH',
      date,
    });

    await outgoingMessage
      .save()
      .then(() => {
        res.status(200).send({
          success: true,
          msg: outgoingMessage,
        });
      })
      .catch((err) => err);
  }
};
