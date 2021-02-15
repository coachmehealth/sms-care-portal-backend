"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageTemplate = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
var Schema = mongoose_1.default.Schema;
var MessageTemplateSchema = new Schema({
    text: { type: String, required: true },
    language: { type: String, required: true },
    type: { type: String, required: true }
});
var MessageTemplate = mongoose_1.default.model('MessageTemplate', MessageTemplateSchema);
exports.MessageTemplate = MessageTemplate;
