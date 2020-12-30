import express from 'express';
import schedule from 'node-schedule';
import { Message, IMessage } from '../models/message.model';
import { Outcome, IOutcome } from '../models/outcome.model';
import { accountSid, authToken, twilioNumber } from '../keys/twilio';
import { Patient } from '../models/patient.model';
import { ObjectId } from 'mongodb';

const twilio = require('twilio')(accountSid, authToken);

const number = twilioNumber.replace(/[^0-9\.]/g, '');
// time in seconds between each run of scheduler
const schedulingInterval = 5;

// selects all messages which should be sent within the next __ seconds, and schedules them to be sent
const scheduleMessages = (interval : number) => {
  // console.log("Scheduling messages to be sent...")
  const intervalStart = new Date();
  const intervalEnd = new Date(intervalStart.getTime());
  intervalEnd.setSeconds(intervalEnd.getSeconds() + interval);

  const messages = Message.find({
    date : {
      $lt: intervalEnd,
    },
    sent: false
  }, (err, docs) => {
    docs.forEach( (doc) => {
      schedule.scheduleJob(doc.date, () => {
        sendMessage(doc);
      });
    });
  });
};

const getPatientIdFromNumber = (number: any) => {
  return Patient.findOne({ phoneNumber: number}).select('_id')
    .then((patientId) => {
      if (!patientId) console.log('No patient found!');
      return patientId;
    })
    .catch((err) => { return (err.message);
    });
};

// sends message, marks it as sent
const sendMessage = (msg : IMessage) => {
  console.log(`Sent message "${msg.message}" to ${msg.phoneNumber}`);
  twilio.messages
    .create({
      body: msg.message,
      from: number, // this is hardcoded right now
      to: msg.phoneNumber
    });
 
  Message.findOneAndUpdate( { _id: msg.id }, {
    sent: true
  }, (err, res) => {
    if (err){
      console.log(err);
    }
  });

  // updates patient's sentmessages
  const getId = getPatientIdFromNumber(msg.phoneNumber).then(
    (id) => {
      const patientId = new ObjectId(id._id);
      Patient.findByIdAndUpdate(patientId, { $inc: { messagesSent : 1}});
    });

};

const initializeScheduler = () => {
  scheduleMessages(schedulingInterval);
  setInterval(() => scheduleMessages(schedulingInterval), schedulingInterval * 1000);
};

export default initializeScheduler;