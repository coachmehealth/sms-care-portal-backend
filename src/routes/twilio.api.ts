/* eslint-disable radix */
import express from 'express';
import { ObjectId } from 'mongodb';
import {
  containsNumber,
  getNumber,
  classifyNumeric,
  containsMany
} from './twilio.util';

import { Message } from '../models/message.model';
import { MessageTemplate } from '../models/messageTemplate.model';
import {TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER} from '../utils/config';

import { Outcome } from '../models/outcome.model';
import { Patient } from '../models/patient.model';
import auth from '../middleware/auth';


const {MessagingResponse} = require('twilio').twiml;

const twilio = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
const bodyParser = require('body-parser');

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));
const responseMap = new Map();

const getPatientIdFromNumber = (number: any) => {
  return Patient.findOne({ phoneNumber: number}).select('_id language')
    .then((patientId) => {
      if (!patientId) console.log(`'No patient found for phone number ${number} !'`);
      return patientId;
    })
    .catch((err) => {
      return (err.message);
    });
};

// function to add responses to the Map
function setResponse(key: string, response: Object) {
  responseMap.set(key, response);
}

function initializeState() {
  setResponse('many nums', { english:'Hi, it looks like you sent more than one number. Please send one number in each message.',
    spanish: 'Hi, it looks like you sent more than one number. Please send one number in each message. (Spanish)'});
  setResponse('toolow', { english:'Your measurement is less than 70. A level less than 70 is low and can harm you. \nTo raise your sugar levels, we recommend you eat or drink sugar now. Try fruit juice with sugar, sugary soda, eat four pieces of candy with sugar. \nAfter 15 minutes, check your sugar levels and text us your measurement. \nIf you continue to measure less than 70, seek urgent medical help.',
    spanish: 'Your number today is too low (Spanish)'});
  setResponse('<80', {english: 'Thank you! How are you feeling? If you feel - sleepy, sweaty, pale, dizzy, irritable, or hungry - your sugar may be too low.\nPlease consume sugar (like juice) to raise your sugars to 80 or above.',
    spanish: 'Your number today is between 70 and 80 (Spanish)'});
  setResponse('green', {english: 'Congratulations! You’re in the green today - keep it up!',
    spanish: 'Green (Spanish)'});
  setResponse('yellow', {english: 'Thank you! You’re in the yellow today - what is one thing you can do to help you lower your glucose levels for tomorrow?',
    spanish: 'Yellow (Spanish)'});
  setResponse('red', {english: 'Thank you! You’re in the red today - your sugars are high. What can you do to lower your number for tomorrow??',
    spanish: 'Red (Spanish)'});
  setResponse('>=301', {english: 'Your measurement is over 300. Fasting blood glucose levels of 300 or more can be dangerous.\nIf you have two readings in a row of 300 or more or are worried about how you feel, call your doctor.',
    spanish: 'Too high (it is greater than 300!) Plesae respond with a valid measurment (Spanish)'});
  setResponse('no', {english: 'Hi, were you able to measure your sugar today? If you need any help with measuring your sugar, please tell your coach.',
    spanish: 'You have entered no measurement (Spanish)'});
  setResponse('catch', {english: 'Hi, I don’t recognize this. Please send a number in your message for us to track your sugar. Thanks!',
    spanish: 'Please respond with a valid input. (Spanish)'});
}

initializeState();

router.post('/sendMessage', auth, (req, res) => {
  const contnet = req.body.message;
  const recept = req.body.to;
  const patientID = new ObjectId(req.body.patientID);
  const date = new Date();

  twilio.messages
    .create({
      body: contnet,
      from: TWILIO_FROM_NUMBER,
      to: recept
    });

  const outgoingMessage = new Message({
    sent: true,
    phoneNumber: TWILIO_FROM_NUMBER,
    patientID,
    message: contnet,
    sender: 'COACH',
    date
  });

  outgoingMessage.save().then(() => {
    res.status(200).send({
      success: true,
      msg: outgoingMessage
    });
  }).catch((err) => console.log(err));
});


// this route receives and parses the message from one user, then responds accordingly with the appropriate output
router.post('/reply', (req, res) => {
  const twiml = new MessagingResponse();
  const message = twiml.message();
  let response = req.body.Body;
  if (!response) {
    response = 'Invalid Text (image)';
  }
  // generate date
  const date = new Date();

  getPatientIdFromNumber(req.body.From.slice(2)).then(
    (patient) => {
      const language = patient.language.toLowerCase();
      const patientId = new ObjectId(patient._id);
      const incomingMessage = new Message({
        sent: true,
        phoneNumber: req.body.To,
        patientID: patientId,
        message: response,
        sender: 'PATIENT',
        date
      });

      incomingMessage.save();
      // if contains many numbers then respond with "too many number inputs"
      // this is a bad outcome, only add to message log
      if (containsMany(response)) {
        const outgoingMessage = new Message({
          sent: true,
          phoneNumber: req.body.To,
          patientID: patientId, // lost on this
          message: responseMap.get('many nums')[language],
          sender: 'BOT',
          date
        });

        outgoingMessage.save().then(() => {
          res.writeHead(200, {'Content-Type': 'text/xml'});
          res.end(twiml.toString());
          message.body(responseMap.get('many nums')[language]);
        });

        // Measurement found
      } else if (containsNumber(response)) {
        const value = getNumber(response);

        if (classifyNumeric(value) === 'green' || classifyNumeric(value) === 'yellow' || classifyNumeric(value) === 'red') {
          const outcome = new Outcome({
            phoneNumber: req.body.From,
            patientID: patientId,
            response, // the entire text the patient sends
            value: value[0], // numerical measurement
            alertType: classifyNumeric(value), // Color
            date
          });
          Patient.findByIdAndUpdate(patientId, { $inc: { responseCount : 1}}).catch((err) => console.log(err));
          outcome.save().then(() => {
          });
          const classification = classifyNumeric(value);
          const typeUpperCase = classification.charAt(0).toUpperCase() + classification.slice(1);
          const upperLang = language.charAt(0).toUpperCase() + language.slice(1);
          MessageTemplate.find({language: upperLang, type: typeUpperCase}).then((messages) => {
            const randomVal =  Math.floor(Math.random() * ((messages.length) - 0));
            const messageTemp = messages[randomVal];
            const outgoingMessage = new Message({
              sent: true,
              phoneNumber: req.body.To,
              patientID: patientId,
              message: messageTemp.text,
              sender: 'BOT',
              date
            });

            outgoingMessage.save();
            message.body(messageTemp.text);
          }).catch(() => {
            const outgoingMessage = new Message({
              sent: true,
              phoneNumber: req.body.To,
              patientID: patientId,
              message: responseMap.get(classifyNumeric(value))[language],
              sender: 'BOT',
              date
            });

            outgoingMessage.save();
            message.body(responseMap.get(classifyNumeric(value))[language]);
          }).finally(() => {
            res.writeHead(200, {'Content-Type': 'text/xml'});
            res.end(twiml.toString());
          });

        } else {
          const outgoingMessage = new Message({
            sent: true,
            phoneNumber: req.body.To,
            patientID: patientId,
            message: responseMap.get(classifyNumeric(value))[language],
            sender: 'BOT',
            date
          });

          outgoingMessage.save().then(() => {
            message.body(responseMap.get(classifyNumeric(value))[language]);
            res.writeHead(200, {'Content-Type': 'text/xml'});
            res.end(twiml.toString());
          });
        }


        // Message is "no"
      } else if (response.toLowerCase() === ('no')) {
        const outgoingMessage = new Message({
          sent: true,
          phoneNumber: req.body.To,
          patientID: patientId,
          message: responseMap.get('no')[language],
          sender: 'BOT',
          date
        });

        outgoingMessage.save().then(() => {
          message.body(responseMap.get('no')[language]);
          res.writeHead(200, {'Content-Type': 'text/xml'});
          res.end(twiml.toString());
        });

        // catch all
      } else {
        const outgoingMessage = new Message({
          sent: true,
          phoneNumber: req.body.To,
          patientID: patientId,
          message: responseMap.get('catch')[language],
          sender: 'BOT',
          date
        });

        outgoingMessage.save().then(() => {
          message.body(responseMap.get('catch')[language]);
          res.writeHead(200, {'Content-Type': 'text/xml'});
          res.end(twiml.toString());
        });
      }

    });
});


export default router;