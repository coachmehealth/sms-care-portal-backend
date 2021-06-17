import twilio from 'twilio';
import { ObjectId } from 'mongodb';
import { PatientForPhoneNumber } from '../../models/patient.model';
import { parseInboundPatientMessage } from '../../domain/message_parsing';
import { responseForParsedMessage } from '../../domain/glucose_reading_responses';
import { Outcome } from '../../models/outcome.model';
import { Message } from '../../models/message.model';
import { MessageGeneral } from '../../models/messageGeneral.model';

const { MessagingResponse } = twilio.twiml;

export const manageIncomingMessages = async (
  req: any,
  res: any,
  UNRECOGNIZED_PATIENT_RESPONSE: string,
  incoming: 'Glucose' | 'General',
) => {
  const twiml = new MessagingResponse();

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
  if (incoming === 'General') {
    const incomingMessage = new MessageGeneral({
      sent: true,
      phoneNumber: req.body.From,
      patientID: patient._id,
      message: inboundMessage,
      sender: 'PATIENT',
      date,
    });

    await incomingMessage.save();

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end();
  }

  if (incoming === 'Glucose') {
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
      sent: false,
      phoneNumber: fromPhoneNumber,
      patientID: patient._id, // lost on this
      message: responseMessage,
      sender: 'GLUCOSE BOT',
      date,
    });

    await outgoingMessage.save();

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.message(responseMessage).toString());
  }
};

export const sendMessage = async (req: any, res: any) => {
  const content = req.body.message;
  const recept = req.body.to;
  const patientID = new ObjectId(req.body.patientID);
  const scheduled = req.body.scheduled || '';
  const date = !scheduled ? new Date() : new Date(scheduled);

  const outgoingMessage = new MessageGeneral({
    sent: false,
    phoneNumber: recept,
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
    // eslint-disable-next-line no-console
    .catch((err) => console.log(err));
};
