"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var errorHandler = function (res, errorMessage, errorCode) {
    if (errorCode === 'invalidToken' || errorCode === 'refreshExpired') {
        return res.status(401).send({
            success: false,
            message: errorMessage,
            code: errorCode,
        });
    }
    return res.status(400).send({
        success: false,
        message: errorMessage,
    });
};
exports.default = errorHandler;
