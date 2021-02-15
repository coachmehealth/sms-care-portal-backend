"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importDefault(require("mongoose"));
var config_1 = require("./config");
function connectToDatabase(cb) {
    mongoose_1.default.Promise = global.Promise;
    mongoose_1.default.connect(config_1.ATLAS_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });
    mongoose_1.default.connection.on('error', console.error.bind(console, 'MongoDB connection error. Please make sure MongoDB is running.'));
    mongoose_1.default.connection.once('open', function () {
        console.log('MongoDB database connection established succesfully 🤖');
    });
    return cb;
}
exports.default = connectToDatabase;
