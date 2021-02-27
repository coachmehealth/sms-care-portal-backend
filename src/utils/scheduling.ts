import schedule from 'node-schedule';
import { ObjectId } from 'mongodb';
import { Message, IMessage } from '../models/message.model';
import {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_FROM_NUMBER,
} from './config';
import { Patient } from '../models/patient.model';

const twilio = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// time in seconds between each run of scheduler
const schedulingInterval = 5;

const getPatientIdFromNumber = (number: any) => {
  return Patient.findOne({ phoneNumber: number })
    .select('_id')
    .then((patientId) => {
      if (!patientId) console.log(`'No patient found for ${number}!'`);
      return patientId;
    })
    .catch((err) => {
      return err.message;
    });
};

// sends message, marks it as sent
const sendMessage = (msg: IMessage) => {
  twilio.messages.create({
    body: msg.message,
    from: TWILIO_FROM_NUMBER,
    to: msg.phoneNumber,
  });

  Message.findOneAndUpdate(
    { _id: msg.id },
    {
      sent: true,
    },
    (err) => {
      if (err) {
        console.log(err);
      }
    },
  );

  // updates patient's sentmessages
  getPatientIdFromNumber(msg.phoneNumber).then((id) => {
    const patientId = new ObjectId(id._id);
    Patient.findByIdAndUpdate(patientId, {
      $inc: { messagesSent: 1 },
    }).catch((err) => console.log(err));
  });
};

// selects all messages which should be sent within the next __ seconds, and schedules them to be sent
const scheduleMessages = (interval: number) => {
  const intervalStart = new Date();
  const intervalEnd = new Date(intervalStart.getTime());
  intervalEnd.setSeconds(intervalEnd.getSeconds() + interval);

  Message.find(
    {
      date: {
        $lt: intervalEnd,
      },
      sent: false,
    },
    (err, docs) => {
      docs.forEach((doc) => {
        schedule.scheduleJob(doc.date, () => {
          sendMessage(doc);
        });
      });
    },
  );
};

const initializeScheduler = () => {
  scheduleMessages(schedulingInterval);
  setInterval(
    () => scheduleMessages(schedulingInterval),
    schedulingInterval * 1000,
  );
};

export default initializeScheduler;
