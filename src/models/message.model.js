"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
var Schema = mongoose_1.default.Schema;
var MessageSchema = new Schema({
    patientID: { type: mongoose_1.default.Schema.Types.ObjectId, required: true },
    phoneNumber: { type: String, required: true },
    message: { type: String, required: true },
    sender: { type: String, required: true },
    image: { data: { type: mongoose_1.default.Schema.Types.Buffer, required: false },
        contentType: { type: String, required: false } },
    date: { type: mongoose_1.default.Schema.Types.Date, required: true },
    sent: { type: mongoose_1.default.Schema.Types.Boolean, default: false }
});
var Message = mongoose_1.default.model('Message', MessageSchema);
exports.Message = Message;
