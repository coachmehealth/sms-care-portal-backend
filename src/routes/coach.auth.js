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
var express_1 = __importDefault(require("express"));
var bcrypt_1 = require("bcrypt");
var coach_model_1 = require("../models/coach.model");
var auth_1 = __importDefault(require("../middleware/auth"));
var error_1 = __importDefault(require("./error"));
var coach_util_1 = require("./coach.util");
var patient_model_1 = require("../models/patient.model");
var mongodb_1 = require("mongodb");
var router = express_1.default.Router();
var saltRounds = 10;
// create new coach
router.post('/signup', auth_1.default, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var firstName, lastName, emailRaw, emailLower, password;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                firstName = req.body.firstName;
                lastName = req.body.lastName;
                emailRaw = req.body.email;
                emailLower = emailRaw.toLowerCase();
                password = req.body.password;
                return [4 /*yield*/, coach_model_1.Coach.findOne({ email: emailLower })];
            case 1:
                if (_a.sent()) {
                    return [2 /*return*/, error_1.default(res, 'User already exists.')];
                }
                // hash + salt password
                return [2 /*return*/, bcrypt_1.hash(password, saltRounds, function (err, hashedPassword) {
                        if (err) {
                            return error_1.default(res, err.message);
                        }
                        var newCoach = new coach_model_1.Coach({
                            firstName: firstName,
                            lastName: lastName,
                            email: emailLower,
                            password: hashedPassword,
                        });
                        return newCoach
                            .save()
                            .then(function () { return res.status(200).json({ success: true }); })
                            .catch(function (e) { return error_1.default(res, e.message); });
                    })];
        }
    });
}); });
// login coach
router.post('/login', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var emailAdress, password;
    return __generator(this, function (_a) {
        emailAdress = req.body.email.toLowerCase();
        password = req.body.password;
        coach_model_1.Coach.findOne({ email: emailAdress }).then(function (coach) {
            // coach does not exist
            if (!coach)
                return error_1.default(res, 'Email or password is incorrect.');
            return bcrypt_1.compare(password, coach.password, function (err, result) {
                if (err)
                    return error_1.default(res, err.message);
                if (result) {
                    // password matched
                    var accessToken = coach_util_1.generateAccessToken(coach);
                    var refreshToken = coach_util_1.generateRefreshToken(coach);
                    return Promise.all([accessToken, refreshToken]).then(function (tokens) {
                        return res.status(200).json({
                            success: true,
                            accessToken: tokens[0],
                            refreshToken: tokens[1],
                        });
                    });
                }
                // wrong password
                return error_1.default(res, 'Email or password is incorrect.');
            });
        });
        return [2 /*return*/];
    });
}); });
// refresh token
router.post('/refreshToken', function (req, res) {
    var refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        return error_1.default(res, 'No token provided.');
    }
    return coach_util_1.validateRefreshToken(refreshToken)
        .then(function (tokenResponse) { return coach_util_1.generateAccessToken(tokenResponse); })
        .then(function (accessToken) {
        res.status(200).json({
            success: true,
            accessToken: accessToken,
        });
    })
        .catch(function (err) {
        if (err.code) {
            return error_1.default(res, err.message, err.code);
        }
        return error_1.default(res, err.message);
    });
});
// get me
// protected route
router.get('/me', auth_1.default, function (req, res) {
    var userId = req.userId;
    return coach_model_1.Coach.findById(new mongodb_1.ObjectId(userId))
        .select('firstName lastName email _id')
        .then(function (coach) {
        if (!coach)
            return error_1.default(res, 'User does not exist.');
        return res.status(200).json({ success: true, data: coach });
    })
        .catch(function (err) { return error_1.default(res, err.message); });
});
router.get('/getPatients', auth_1.default, function (req, res) {
    var patientID = req.params.id;
    return patient_model_1.Patient.find().then(function (patients) {
        return res.status(200).json(patients);
    });
});
router.get('/search', auth_1.default, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var query;
    return __generator(this, function (_a) {
        query = req.query.query;
        coach_model_1.Coach.aggregate([
            { $project: { "name": { $concat: ["$firstName", " ", "$lastName"] } } },
            { $match: {
                    "name": {
                        $regex: query,
                        $options: "i"
                    }
                } }
        ]).exec(function (err, result) {
            return res.status(200).json({
                coaches: result
            });
        });
        return [2 /*return*/];
    });
}); });
exports.default = router;
