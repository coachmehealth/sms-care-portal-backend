"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Outcome = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
var Schema = mongoose_1.default.Schema;
;
var OutcomeSchema = new Schema({
    patientID: { type: mongoose_1.default.Schema.Types.ObjectId, required: true },
    phoneNumber: { type: String, required: true },
    date: { type: Date, required: true },
    response: { type: String, required: true },
    value: { type: Number, required: false },
    alertType: { type: String, required: false }
});
var Outcome = mongoose_1.default.model('Outcome', OutcomeSchema);
exports.Outcome = Outcome;
