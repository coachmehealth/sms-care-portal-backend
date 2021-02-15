"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRefreshToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
var jsonwebtoken_1 = require("jsonwebtoken");
var _ = __importStar(require("lodash"));
var coach_model_1 = require("../models/coach.model");
var config_1 = require("../utils/config");
var AuthError = /** @class */ (function (_super) {
    __extends(AuthError, _super);
    function AuthError(code, message) {
        var _this = _super.call(this, message) || this;
        _this.code = code;
        return _this;
    }
    return AuthError;
}(Error));
var generateAccessToken = function (coach) {
    return jsonwebtoken_1.sign(_.omit(coach.toObject(), 'password'), config_1.JWT_SECRET, {
        expiresIn: '5 m',
    });
};
exports.generateAccessToken = generateAccessToken;
var generateRefreshToken = function (coach) {
    var refreshToken = jsonwebtoken_1.sign({ type: 'refresh' }, config_1.JWT_SECRET, {
        expiresIn: '9999 years',
    });
    return coach_model_1.Coach.findOneAndUpdate({ email: coach.email }, { refreshToken: refreshToken })
        .then(function () { return refreshToken; })
        .catch(function (err) {
        throw err;
    });
};
exports.generateRefreshToken = generateRefreshToken;
var validateRefreshToken = function (refreshToken) {
    return new Promise(function (res, rej) {
        jsonwebtoken_1.verify(refreshToken, config_1.JWT_SECRET, function (err) {
            if (err) {
                rej(new AuthError('refreshExpired', 'Refresh token expired'));
            }
            else {
                coach_model_1.Coach.findOne({ refreshToken: refreshToken })
                    .then(function (coach) {
                    if (!coach) {
                        rej(new AuthError('invalidToken', 'Refresh token invalid'));
                    }
                    res(coach);
                })
                    .catch(function (e) {
                    rej(e);
                });
            }
        });
    });
};
exports.validateRefreshToken = validateRefreshToken;
