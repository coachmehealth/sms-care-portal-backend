"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var node_schedule_1 = __importDefault(require("node-schedule"));
var message_model_1 = require("../models/message.model");
var twilio_1 = require("../keys/twilio");
var patient_model_1 = require("../models/patient.model");
var mongodb_1 = require("mongodb");
var twilio = require('twilio')(twilio_1.accountSid, twilio_1.authToken);
if (twilio_1.twilioNumber) {
    var number = twilio_1.twilioNumber.replace(/[^0-9\.]/g, '');
}
else {
    var number = "MISSING";
    console.log("No phone number found in env vars!");
}
// time in seconds between each run of scheduler
var schedulingInterval = 5;
// selects all messages which should be sent within the next __ seconds, and schedules them to be sent
var scheduleMessages = function (interval) {
    var intervalStart = new Date();
    var intervalEnd = new Date(intervalStart.getTime());
    intervalEnd.setSeconds(intervalEnd.getSeconds() + interval);
    var messages = message_model_1.Message.find({
        date: {
            $lt: intervalEnd,
        },
        sent: false
    }, function (err, docs) {
        docs.forEach(function (doc) {
            node_schedule_1.default.scheduleJob(doc.date, function () {
                sendMessage(doc);
            });
        });
    });
};
var getPatientIdFromNumber = function (number) {
    return patient_model_1.Patient.findOne({ phoneNumber: number }).select('_id')
        .then(function (patientId) {
        if (!patientId)
            console.log("'No patient found for " + number + "!'");
        return patientId;
    })
        .catch(function (err) {
        return (err.message);
    });
};
// sends message, marks it as sent
var sendMessage = function (msg) {
    twilio.messages
        .create({
        body: msg.message,
        from: number,
        to: msg.phoneNumber
    });
    message_model_1.Message.findOneAndUpdate({ _id: msg.id }, {
        sent: true
    }, function (err, res) {
        if (err) {
            console.log(err);
        }
    });
    // updates patient's sentmessages
    getPatientIdFromNumber(msg.phoneNumber).then(function (id) {
        var patientId = new mongodb_1.ObjectId(id._id);
        patient_model_1.Patient.findByIdAndUpdate(patientId, { $inc: { messagesSent: 1 } }).catch(function (err) { return console.log(err); });
    });
};
var initializeScheduler = function () {
    scheduleMessages(schedulingInterval);
    setInterval(function () { return scheduleMessages(schedulingInterval); }, schedulingInterval * 1000);
};
exports.default = initializeScheduler;
