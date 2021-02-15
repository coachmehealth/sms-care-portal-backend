"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Patient = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
var Schema = mongoose_1.default.Schema;
;
var PatientSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    coachID: { type: mongoose_1.default.Schema.Types.ObjectId },
    coachName: { type: String, required: true },
    language: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    prefTime: { type: Number, required: true },
    messagesSent: { type: Number, required: true },
    responseCount: { type: Number, required: true },
    reports: [{
            data: { type: Buffer, required: true },
            contentType: { type: String, required: true }
        }],
    enabled: { type: Boolean, required: true },
});
var Patient = mongoose_1.default.model('Patient', PatientSchema);
exports.Patient = Patient;
