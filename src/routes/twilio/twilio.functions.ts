import twilio from 'twilio';
import { PatientForPhoneNumber } from '../../models/patient.model';
import { parseInboundPatientMessage } from '../../domain/message_parsing';
import { responseForParsedMessage } from '../../domain/glucose_reading_responses';
import { Outcome } from '../../models/outcome.model';
import { Message } from '../../models/message.model';

const { MessagingResponse } = twilio.twiml;

const manageIncomingMessages = async (
  req: any,
  res: any,
  UNRECOGNIZED_PATIENT_RESPONSE: string,
  incoming: 'Glucose' | 'Coach',
) => {
  const twiml = new MessagingResponse();

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

  const incomingMessage = new Message({
    sent: true,
    phoneNumber: req.body.From,
    patientID: patient._id,
    message: inboundMessage,
    receivingNumber: 'Glucose',
    sender: 'PATIENT',
    date,
  });

  await incomingMessage.save();

  if (incoming === 'Coach') {
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end();
  }

  if (incoming === 'Glucose') {
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
      sent: true,
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

export default manageIncomingMessages;
