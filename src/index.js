"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var path_1 = __importDefault(require("path"));
var body_parser_1 = __importDefault(require("body-parser"));
var cors_1 = __importDefault(require("cors"));
var socket_io_1 = __importDefault(require("socket.io"));
var express_status_monitor_1 = __importDefault(require("express-status-monitor"));
var mongo_1 = __importDefault(require("./utils/mongo"));
require("./utils/config");
var patient_api_1 = __importDefault(require("./routes/patient.api"));
var messages_api_1 = __importDefault(require("./routes/messages.api"));
var coach_auth_1 = __importDefault(require("./routes/coach.auth"));
var twilio_api_1 = __importDefault(require("./routes/twilio.api"));
var messageTemplate_api_1 = __importDefault(require("./routes/messageTemplate.api"));
var app = express_1.default();
mongo_1.default(function (err) {
    if (err)
        console.log(err);
});
app.set('port', process.env.PORT || 5000);
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(cors_1.default());
// API Routes
app.use('/api/patients', patient_api_1.default);
app.use('/api/coaches', coach_auth_1.default);
app.use('/api/messages', messages_api_1.default);
app.use('/api/twilio', twilio_api_1.default);
app.use('/api/messageTemplate', messageTemplate_api_1.default);
// Serving static files
if (process.env.NODE_ENV === 'production') {
    var root_1 = path_1.default.join(__dirname, 'client', 'build');
    app.use(express_1.default.static(root_1));
    app.get('*', function (_, res) {
        res.sendFile('index.html', { root: root_1 });
    });
}
var server = app.listen(app.get('port'), function () {
    console.log("Listening on port " + app.get('port') + " \uD83D\uDE80");
    console.log('Press Command C to stop\n');
});
var io = socket_io_1.default(server);
io.on('connection', function (soc) {
    console.log('Connected...');
    soc.on('disconnect', function () {
        console.log('Disconnected');
    });
});
app.set('socketio', io);
app.use(express_status_monitor_1.default({ websocket: io }));
