import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import socket from 'socket.io';
import connectToDatabase from './utils/mongo';
import './utils/config';

import patientRouter from './routes/patient.api';
import messageRouter from './routes/messages.api';
import coachRouter from './routes/coach.auth';
import twilioRouter from './routes/twilio.api';
import messageTemplateRouter from './routes/messageTemplate.api';
import RequireHttps from './middleware/require_https';

const app = express();

connectToDatabase((err) => {
  if (err) console.log(err);
});

app.set('port', process.env.PORT || 3000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(RequireHttps);

// API Routes
app.use('/api/patients', patientRouter);
app.use('/api/coaches', coachRouter);
app.use('/api/messages', messageRouter);
app.use('/api/twilio', twilioRouter);
app.use('/api/messageTemplate', messageTemplateRouter);

const server = app.listen(app.get('port'), () => {
  console.log(`Listening on port ${app.get('port')} 🚀`);
  console.log('Press Command C to stop\n');
});

const io = socket(server);
io.on('connection', (soc) => {
  console.log('Connected...');
  soc.on('disconnect', () => {
    console.log('Disconnected');
  });
});

app.set('socketio', io);
