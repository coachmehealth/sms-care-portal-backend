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
/* eslint-disable @typescript-eslint/indent */
var express_1 = __importDefault(require("express"));
var outcome_model_1 = require("../models/outcome.model");
var patient_model_1 = require("../models/patient.model");
var auth_1 = __importDefault(require("../middleware/auth"));
var error_1 = __importDefault(require("./error"));
var message_model_1 = require("../models/message.model");
var ObjectId = require('mongoose').Types.ObjectId;
var router = express_1.default.Router();
router.post("/add", auth_1.default, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var splitTime, hours, mins, newPatient;
    return __generator(this, function (_a) {
        // validate phone number
        if (!req.body.phoneNumber || req.body.phoneNumber.match(/\d/g) == null || req.body.phoneNumber.match(/\d/g).length !== 10) {
            return [2 /*return*/, res.status(400).json({
                    msg: "Unable to add patient: invalid phone number"
                })];
        }
        if (req.body.firstName == "") {
            return [2 /*return*/, res.status(400).json({
                    msg: "Unable to add patient: must include first name"
                })];
        }
        if (req.body.lastName == "") {
            return [2 /*return*/, res.status(400).json({
                    msg: "Unable to add patient: must include last name"
                })];
        }
        if (req.body.language == "") {
            return [2 /*return*/, res.status(400).json({
                    msg: "Unable to add patient: must include language"
                })];
        }
        if (!req.body.coachId || req.body.coachId == "") {
            return [2 /*return*/, res.status(400).json({
                    msg: "Unable to add patient: select a coach from the dropdown"
                })];
        }
        splitTime = req.body.msgTime.split(":");
        if (splitTime.length != 2) {
            return [2 /*return*/, res.status(400).json({
                    msg: "Unable to add patient: invalid message time"
                })];
        }
        hours = Number(splitTime[0]);
        mins = Number(splitTime[1]);
        if (isNaN(hours) || isNaN(mins) || hours < 0 || hours >= 24 || mins >= 60 || mins < 0) {
            return [2 /*return*/, res.status(400).json({
                    msg: "Unable to add patient: invalid message time"
                })];
        }
        newPatient = new patient_model_1.Patient({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            language: req.body.language,
            phoneNumber: req.body.phoneNumber,
            reports: [],
            responseCount: 0,
            messagesSent: 0,
            coachID: req.body.coachId,
            coachName: req.body.coachName,
            enabled: req.body.isEnabled,
            prefTime: hours * 60 + mins
        });
        return [2 /*return*/, newPatient.save().then(function () {
                res.status(200).json({
                    success: true
                });
            })];
    });
}); });
// maybe make this not accessible or something not sure how
router.get('/getPatient/:id', auth_1.default, function (req, res) {
    patient_model_1.Patient.findOne({
        _id: req.params.id
    }).then(function (patient) {
        res.status(200).json(patient);
    }).catch(function () {
        res.status(404).json({
            msg: 'Unable to increase response count: patient ID not found'
        });
    });
});
router.put('/increaseResponseCount/:id', auth_1.default, function (req, res) {
    if (!req.body.phoneNumber || req.body.phoneNumber.match(/\d/g) == null || req.body.phoneNumber.match(/\d/g).length !== 10) {
        return res.status(400).json({
            msg: 'Unable to add patient: invalid phone number'
        });
    }
    if (req.body.firstName == '') {
        return res.status(400).json({
            msg: 'Unable to add patient: must include first name'
        });
    }
    if (req.body.lastName == '') {
        return res.status(400).json({
            msg: 'Unable to add patient: must include last name'
        });
    }
    if (req.body.language == '') {
        return res.status(400).json({
            msg: 'Unable to add patient: must include language'
        });
    }
    var patient = new patient_model_1.Patient({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        language: req.body.language,
        phoneNumber: req.body.phoneNumber,
        reports: [],
        responseCount: req.body.responseCount,
        messagesSent: req.body.messagesSent,
    });
    patient_model_1.Patient.updateOne({ _id: req.params.id }, patient).then(function () {
        res.status(201).json({
            msg: 'Patient response count updated successfully!',
            sucess: true
        });
    });
});
router.get('/getPatientOutcomes/:patientID', auth_1.default, function (req, res) {
    var id = req.params.patientID;
    return outcome_model_1.Outcome.find({ patientID: new ObjectId(id) })
        .then(function (outcomeList) {
        if (!outcomeList || outcomeList.length == 0)
            return error_1.default(res, 'No outcomes found!');
        return res.status(200).json(outcomeList.sort(function (a, b) { return b.date - a.date; }));
    })
        .catch(function (err) { return error_1.default(res, err.message); });
});
router.get('/getPatient/:patientID', auth_1.default, function (req, res) {
    var id = req.params.patientID;
    return patient_model_1.Patient.findById(new ObjectId(id))
        .then(function (patient) {
        if (!patient)
            return error_1.default(res, 'No patient found!');
        return res.status(200).json(patient);
    })
        .catch(function (err) { return error_1.default(res, err.message); });
});
router.get('/getPatientMessages/:patientID', auth_1.default, function (req, res) {
    var id = req.params.patientID;
    return message_model_1.Message.find({ patientID: new ObjectId(id) })
        .then(function (outcomeList) {
        if (!outcomeList || outcomeList.length == 0)
            return error_1.default(res, 'No outcomes found!');
        return res.status(200).json(outcomeList);
    })
        .catch(function (err) { return error_1.default(res, err.message); });
});
router.post('/status', auth_1.default, function (req, res) {
    var id = req.body.id;
    var status = req.body.status;
    return patient_model_1.Patient.findByIdAndUpdate(new ObjectId(id), { enabled: status })
        .then(function (updatedPaitnet) {
        return res.status(200).json("Patiet Status Changed!");
    })
        .catch(function (err) { return error_1.default(res, err.message); });
});
exports.default = router;
