/* eslint-disable no-console */
/* eslint-disable prettier/prettier */
import { ObjectId } from 'mongodb';
import { Message } from '../models/message.model';
import { MessageTemplate } from '../models/messageTemplate.model';
import { IPatient, Patient } from '../models/patient.model';
import { Outcome, IOutcome } from '../models/outcome.model';
import { Schedule } from '../models/schedule.model';

interface IweekRecords {
  [char: string]: number;
}

export const dailyMidnightMessages = () => {
  console.log('Running batch of scheduled messages');
  Patient.find().then((patients) => {
    MessageTemplate.find({ type: 'Initial' })
      .then((MessageTemplates) => {
        patients.forEach(async (patient) => {
          if (patient.enabled) {
            const messages = MessageTemplates.filter(
              (template) =>
                template.language.toLowerCase() ===
                patient.language.toLowerCase(),
            );
            if (messages.length < 1) {
              console.log(
                'Unable to find message appropriate for member = ',
                patient._id,
              );
              return;
            }
            const randomVal = Math.floor(Math.random() * messages.length);
            const message = messages[randomVal].text;
            const newMessage = new Message({
              patientID: new ObjectId(patient._id),
              phoneNumber: patient.phoneNumber,
              date: new Date(),
              message,
              sender: 'BOT',
              sent: false,
            });
            await newMessage.save();
          }
        });
      })
      .catch((err) => console.log(err));
  });
};

export const compareOutcomesByDate = (a: IOutcome, b: IOutcome) => {
  if (a.date > b.date) {
    return 1;
  }
  if (a.date < b.date) {
    return -1;
  }
  return 0;
};

export const returnColorRanges = (value: number) => {
  // White circle
  if (value < 80) {
    return String.fromCodePoint(9898);
  }
  // Red circle
  if (value > 180) {
    return String.fromCodePoint(128308);
  }
  // Yellow circle
  if (value > 129) {
    return String.fromCodePoint(128993);
  }
  // Green circle
  return String.fromCodePoint(128994);
};

export const getDayBody = (
  body: string,
  day: string,
  value: number,
  language: string,
) => {
  if (language === 'english') {
    if (value > 0) {
      const newbody = `${body}  ${returnColorRanges(value)} ${day}: ${value}\n`;
      return newbody;
    }
  }

  if (language === 'spanish') {
    if (value > 0) {
      const newbody = `${body}  ${returnColorRanges(value)} ${day}: ${value}\n`;
      return newbody;
    }
  }

  return body;
};

export const getWeeklyList = (
  recordedCount: number,
  weekAverage: number,
  weekRecords: IweekRecords,
  language: string,
) => {
  let body = '';
  if (recordedCount > 0) {
    const averageColor = returnColorRanges(weekAverage);
    if (language === 'english') {
      body += `${averageColor} Average: ${weekAverage} mg/dL\n\n`;
      body = getDayBody(body, 'Mon', weekRecords.monday, 'english');
      body = getDayBody(body, 'Tues', weekRecords.tuesday, 'english');
      body = getDayBody(body, 'Wed', weekRecords.wednesday, 'english');
      body = getDayBody(body, 'Thurs', weekRecords.thursday, 'english');
      body = getDayBody(body, 'Fri', weekRecords.friday, 'english');
      body = getDayBody(body, 'Sat', weekRecords.saturday, 'english');
      body = getDayBody(body, 'Sun', weekRecords.sunday, 'english');
    }

    if (language === 'spanish') {
      body += `${averageColor} Promedio: ${weekAverage} mg/dL\n\n`;
      body = getDayBody(body, 'Mon', weekRecords.monday, 'spanish');
      body = getDayBody(body, 'Tues', weekRecords.tuesday, 'spanish');
      body = getDayBody(body, 'Wed', weekRecords.wednesday, 'spanish');
      body = getDayBody(body, 'Thurs', weekRecords.thursday, 'spanish');
      body = getDayBody(body, 'Fri', weekRecords.friday, 'spanish');
      body = getDayBody(body, 'Sat', weekRecords.saturday, 'spanish');
      body = getDayBody(body, 'Sun', weekRecords.sunday, 'spanish');
    }
  }
  return body;
};

export const getMessageTemplate = (
  greenCount: number,
  recordedCount: number,
  weekAverage: number,
  weekRecords: IweekRecords,
  language: string,
) => {
  const recordedCountEmoji = String.fromCodePoint(
    48 + recordedCount,
    65039,
    8419,
  );
  let message = '';
  if (language === 'english') {
    message += `🎯Great job! You recorded your sugar levels for ${recordedCountEmoji}  days this week! 🥳
  You were in the 🟢(80 - 130) ${greenCount} of 7️⃣ days!
    
  👉Take 1 minute to remember what you did to keep your sugars in the green, so you can do it again next week.
  ${getWeeklyList(recordedCount, weekAverage, weekRecords, 'english')}
    `;
  }
  if (language === 'spanish') {
    message += `🎯Excelente trabajo! Enviaste tus niveles de glucosa ${recordedCountEmoji}  días esta semana! 🥳
  !Estuviste en el 🟢(80 - 130) ${greenCount} de los 7️⃣ días!
  
  👉Toma 1 minuto para recordar que hiciste para mantener tu azúcar en el verde, y puedas hacerlo de nuevo la siguiente semana.
  ${getWeeklyList(recordedCount, weekAverage, weekRecords, 'spanish')}
    `;
  }

  return message;
};

export const getAverageAndCounts = (weekRecords: IweekRecords) => {
  let weekAverage = 0;
  let recordedCount = 0;
  let greenCount = 0;
  const keys = Object.keys(weekRecords);
  keys.forEach((key) => {
    if (weekRecords[key] > 0) {
      recordedCount += 1;
      weekAverage += weekRecords[key];
      if (weekRecords[key] < 130 && weekRecords[key] > 80) {
        greenCount += 1;
      }
    }
  });
  weekAverage /= recordedCount;
  weekAverage = Math.round(weekAverage);

  return [weekAverage, recordedCount, greenCount];
};

export const getPatientOutcomes = async (patient: IPatient) => {
  if (patient.enabled) {
    const lastMonday = new Date();
    lastMonday.setDate(lastMonday.getDate() - ((lastMonday.getDay() + 6) % 7));
    const weeklyPatientOutcomes = await Outcome.find({
      date: {
        $gt: new Date(
          lastMonday.getFullYear(),
          lastMonday.getMonth(),
          lastMonday.getDate() - 7,
        ),
        $lt: new Date(
          lastMonday.getFullYear(),
          lastMonday.getMonth(),
          lastMonday.getDate() + 1,
        ),
      },
      patientID: patient._id,
    });

    return weeklyPatientOutcomes;
  }
  return '';
};

export const getWeekRecords = (outcomes: IOutcome[]) => {
  const weekRecords: IweekRecords = {
    monday: 0,
    tuesday: 0,
    wednesday: 0,
    thursday: 0,
    friday: 0,
    saturday: 0,
    sunday: 0,
  };
  outcomes.sort(compareOutcomesByDate);
  outcomes.forEach((outcome) => {
    switch (outcome.date.getDay()) {
      case 0:
        weekRecords.sunday = outcome.value;
        break;
      case 1:
        weekRecords.monday = outcome.value;
        break;
      case 2:
        weekRecords.tuesday = outcome.value;
        break;
      case 3:
        weekRecords.wednesday = outcome.value;
        break;
      case 4:
        weekRecords.thursday = outcome.value;
        break;
      case 5:
        weekRecords.friday = outcome.value;
        break;
      case 6:
        weekRecords.saturday = outcome.value;
        break;
      default:
        break;
    }
  });

  return weekRecords;
};

export const getWeekMessage = (
  patient: IPatient,
  weekRecords: IweekRecords,
) => {
  const [weekAverage, recordedCount, greenCount] =
    getAverageAndCounts(weekRecords);
  
  const language = patient.language.toLowerCase() === 'english' ? 'english' : 'spanish';
  const message = getMessageTemplate(
    greenCount,
    recordedCount,
    weekAverage,
    weekRecords,
    language,
  );

  return message;
};

const sendOutcomesToPatients = async () => {
  const patients = await Patient.find();

  patients.forEach(async (patient) => {
    const outcomes = await getPatientOutcomes(patient);
    if (outcomes) {
      const weekRecords = getWeekRecords(outcomes);
      const message = getWeekMessage(patient, weekRecords);
      const newMessage = new Message({
        patientID: new ObjectId(patient._id),
        phoneNumber: patient.phoneNumber,
        date: new Date(),
        message,
        sender: 'BOT',
        sent: false,
      });
      newMessage.save();
    }
  });
};

export const weeklyReport = async () => {
  const schedules = await Schedule.findOne({});
  const lastMonday = new Date();
  lastMonday.setDate(lastMonday.getDate() - ((lastMonday.getDay() + 6) % 7));
  if (!schedules) {
    const newSchedule = new Schedule({ weeklyReport: lastMonday });
    await newSchedule.save();
    weeklyReport();
  }
  if (schedules) {
    const dateDifference = lastMonday.getDate() - schedules.weeklyReport.getDate();
    if (dateDifference > 0) {
      await Schedule.findOneAndUpdate({}, { weeklyReport: new Date() });
      sendOutcomesToPatients();
    }
  }
};
