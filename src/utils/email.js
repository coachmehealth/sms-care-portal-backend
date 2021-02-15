"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendDynamicEmail = exports.sendEmail = void 0;
var mail_1 = __importDefault(require("@sendgrid/mail"));
var config_1 = require("./config");
mail_1.default.setApiKey(config_1.SENDGRID_API_KEY);
var validateEmail = function (email) {
    var emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegexp.test(email);
};
var sendEmail = function (email) {
    if (!validateEmail(email.to))
        throw new Error('Email validation failed.');
    mail_1.default.send(email);
};
exports.sendEmail = sendEmail;
var sendDynamicEmail = function (email) {
    if (!validateEmail(email.to))
        throw new Error('Email validation failed.');
    var msg = {
        to: email.to,
        from: email.from,
        templateId: email.templateId,
        dynamic_template_data: email.dynamic_template_data,
    };
    mail_1.default.send(msg);
};
exports.sendDynamicEmail = sendDynamicEmail;
