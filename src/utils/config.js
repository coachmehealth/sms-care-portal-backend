"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SENDGRID_EMAIL = exports.SENDGRID_API_KEY = exports.JWT_SECRET = exports.ATLAS_URI = void 0;
var dotenv_1 = require("dotenv");
var path_1 = require("path");
switch (process.env.NODE_ENV) {
    case 'development':
        console.log("Environment is 'development'");
        dotenv_1.config({
            path: path_1.resolve(__dirname, '../../.env.development'),
        });
        break;
    case 'production':
        console.log("Environment is 'production'");
        break;
    default:
        
        throw new Error("'NODE_ENV' " + process.env.NODE_ENV + " is not handled!");
}
var ATLAS_URI = process.env.ATLAS_URI || '';
exports.ATLAS_URI = ATLAS_URI;
var JWT_SECRET = process.env.JWT_SECRET || '';
exports.JWT_SECRET = JWT_SECRET;
// sendgrid configs
var SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
exports.SENDGRID_API_KEY = SENDGRID_API_KEY;
var SENDGRID_EMAIL = 'hello@email.com';
exports.SENDGRID_EMAIL = SENDGRID_EMAIL;
