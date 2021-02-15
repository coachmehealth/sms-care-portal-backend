"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-shadow */
var express_1 = __importDefault(require("express"));
var cron = require('node-cron');
var ObjectsToCsv = require('objects-to-csv');
var mongodb_1 = require("mongodb");
var auth_1 = __importDefault(require("../middleware/auth"));
var message_model_1 = require("../models/message.model");
var messageTemplate_model_1 = require("../models/messageTemplate.model");
var outcome_model_1 = require("../models/outcome.model");
var patient_model_1 = require("../models/patient.model");
var scheduling_1 = __importDefault(require("../utils/scheduling"));
var error_1 = __importDefault(require("./error"));
var router = express_1.default.Router();
scheduling_1.default();
//run messages every day at midnight PST
cron.schedule('0 0 0 * * *', function () {
    console.log("Running batch of schdueled messages");
    patient_model_1.Patient.find().then(function (patients) {
        messageTemplate_model_1.MessageTemplate.find({ type: "Initial" }).then(function (MessageTemplates) {
            var _loop_1 = function (patient) {
                if (patient.enabled) {
                    var messages = MessageTemplates.filter(function (template) { return template.language === patient.language; });
                    var randomVal = Math.floor(Math.random() * (messages.length));
                    var message = messages[randomVal].text;
                    date = new Date();
                    date.setMinutes(date.getMinutes() + 1);
                    var newMessage = new message_model_1.Message({
                        patientID: new mongodb_1.ObjectId(patient._id),
                        phoneNumber: patient.phoneNumber,
                        date: date,
                        message: message,
                        sender: 'BOT',
                        sent: false
                    });
                    newMessage.save();
                }
            };
            var date;
            for (var _i = 0, patients_1 = patients; _i < patients_1.length; _i++) {
                var patient = patients_1[_i];
                _loop_1(patient);
            }
        }).catch(function (err) { return console.log(err); });
    });
}, {
    scheduled: true,
    timezone: "America/Los_Angeles"
});
router.post('/newMessage', auth_1.default, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var newMessage;
    return __generator(this, function (_a) {
        // validate phone number
        if (!req.body.phoneNumber || req.body.phoneNumber.match(/\d/g) == null || req.body.phoneNumber.match(/\d/g).length !== 10) {
            return [2 /*return*/, res.status(400).json({
                    msg: 'Unable to add message: invalid phone number'
                })];
        }
        if (!req.body.patientID || req.body.patientID == '') {
            return [2 /*return*/, res.status(400).json({
                    msg: 'Unable to add message: must include patient ID'
                })];
        }
        if (!req.body.sender || req.body.sender == '') {
            return [2 /*return*/, res.status(400).json({
                    msg: 'Unable to add message: must include sender'
                })];
        }
        if (!req.body.date || req.body.date == '') {
            return [2 /*return*/, res.status(400).json({
                    msg: 'Unable to add message: must include date'
                })];
        }
        if (req.body.image == null) {
            newMessage = new message_model_1.Message({
                phoneNumber: req.body.phoneNumber,
                patientID: req.body.patientID,
                message: req.body.message,
                sender: req.body.sender,
                date: req.body.date
            });
            return [2 /*return*/, newMessage.save().then(function () {
                    res.status(200).json({
                        success: true
                    });
                })];
        }
        return [2 /*return*/];
    });
}); });
router.post('/newOutcome', auth_1.default, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var newOutcome;
    return __generator(this, function (_a) {
        // validate phone number
        if (!req.body.phoneNumber || req.body.phoneNumber.match(/\d/g) == null || req.body.phoneNumber.match(/\d/g).length !== 10) {
            return [2 /*return*/, res.status(400).json({
                    msg: 'Unable to add outcome: invalid phone number'
                })];
        }
        if (req.body.patientID == '') {
            return [2 /*return*/, res.status(400).json({
                    msg: 'Unable to add outcome: must include patient ID'
                })];
        }
        if (req.body.language == '') {
            return [2 /*return*/, res.status(400).json({
                    msg: 'Unable to add outcome: must include language'
                })];
        }
        newOutcome = new outcome_model_1.Outcome({
            patientID: req.body.patientID,
            phoneNumber: req.body.phoneNumber,
            date: req.body.date,
            response: req.body.response,
            value: req.body.value,
            alertType: req.body.alertType
        });
        patient_model_1.Patient.findOneAndUpdate({ _id: req.body.patientID }, { $inc: { responseCount: 1 } });
        return [2 /*return*/, newOutcome.save().then(function () {
                res.status(200).json({
                    success: true
                });
            })];
    });
}); });
router.post('/scheduledMessage', auth_1.default, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var newMessage;
    return __generator(this, function (_a) {
        // validate phone number
        if (!req.body.phoneNumber || req.body.phoneNumber.match(/\d/g) == null || req.body.phoneNumber.match(/\d/g).length !== 10) {
            return [2 /*return*/, res.status(400).json({
                    msg: 'Unable to add outcome: invalid phone number'
                })];
        }
        if (req.body.patientID == '') {
            return [2 /*return*/, res.status(400).json({
                    msg: 'Unable to add outcome: must include patient ID'
                })];
        }
        if (req.body.language == '') {
            return [2 /*return*/, res.status(400).json({
                    msg: 'Unable to add outcome: must include language'
                })];
        }
        newMessage = new message_model_1.Message({
            patientID: req.body.patientID,
            phoneNumber: req.body.phoneNumber,
            date: req.body.date,
            response: req.body.response,
            value: req.body.value,
            alertType: req.body.alertType
        });
        return [2 /*return*/, newMessage.save().then(function () {
                patient_model_1.Patient.findByIdAndUpdate(new mongodb_1.ObjectId(req.body.patientId), { $inc: { messagesSent: 1 } });
                res.status(200).json({
                    success: true
                });
            })];
    });
}); });
router.get('/allOutcomes', auth_1.default, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, outcome_model_1.Outcome.find()
                .then(function (outcomesList) {
                patient_model_1.Patient.find().then(function (patientList) {
                    res.status(200).send({ outcomes: outcomesList, patients: patientList });
                });
            })
                .catch(function (err) { return error_1.default(res, err.msg); })];
    });
}); });
exports.default = router;
