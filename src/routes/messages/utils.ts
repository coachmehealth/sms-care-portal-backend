/* eslint-disable @typescript-eslint/indent */
import { ObjectId } from 'mongodb';
import { Message } from '../../models/message.model';
import { MessageTemplate } from '../../models/messageTemplate.model';
import { Patient } from '../../models/patient.model';
import { Outcome, IOutcome } from '../../models/outcome.model';
import { outreachMessage } from '../outreach/outreachResponses';

interface IweekRecords {
  [char: string]: number;
}

export const dailyMidnightMessages = () => {
  console.log('Running batch of scheduled messages');
  Patient.find().then((patients) => {
    MessageTemplate.find({ type: 'Initial' })
      .then((MessageTemplates) => {
        patients.forEach((patient) => {
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
            const date = new Date();
            date.setMinutes(date.getMinutes() + 1);
            const newMessage = new Message({
              patientID: new ObjectId(patient._id),
              phoneNumber: patient.phoneNumber,
              date,
              message,
              sender: 'BOT',
              sent: false,
            });
            newMessage.save();
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
      if (weekRecords.monday > 0) {
        body += `  ${returnColorRanges(weekRecords.monday)} Mon: ${
          weekRecords.monday
        }\n`;
      }
      if (weekRecords.tuesday > 0) {
        body += `  ${returnColorRanges(weekRecords.tuesday)} Tues: ${
          weekRecords.tuesday
        }\n`;
      }
      if (weekRecords.wednesday > 0) {
        body += `  ${returnColorRanges(weekRecords.wednesday)} Wed: ${
          weekRecords.wednesday
        }\n`;
      }
      if (weekRecords.thursday > 0) {
        body += `  ${returnColorRanges(weekRecords.thursday)} Thurs: ${
          weekRecords.thursday
        }\n`;
      }
      if (weekRecords.friday > 0) {
        body += `  ${returnColorRanges(weekRecords.friday)} Fri: ${
          weekRecords.friday
        }\n`;
      }
      if (weekRecords.saturday > 0) {
        body += `  ${returnColorRanges(weekRecords.saturday)} Sat: ${
          weekRecords.saturday
        }\n`;
      }
      if (weekRecords.sunday > 0) {
        body += `  ${returnColorRanges(weekRecords.sunday)} Sun: ${
          weekRecords.sunday
        }`;
      }
    }

    if (language === 'spanish') {
      body += `${averageColor} Promedio: ${weekAverage} mg/dL\n\n`;
      if (weekRecords.monday > 0) {
        body += `  ${returnColorRanges(weekRecords.monday)} Lun: ${
          weekRecords.monday
        }\n`;
      }
      if (weekRecords.tuesday > 0) {
        body += `  ${returnColorRanges(weekRecords.tuesday)} Mar: ${
          weekRecords.tuesday
        }\n`;
      }
      if (weekRecords.wednesday > 0) {
        body += `  ${returnColorRanges(weekRecords.wednesday)} Mie: ${
          weekRecords.wednesday
        }\n`;
      }
      if (weekRecords.thursday > 0) {
        body += `  ${returnColorRanges(weekRecords.thursday)} Jue: ${
          weekRecords.thursday
        }\n`;
      }
      if (weekRecords.friday > 0) {
        body += `  ${returnColorRanges(weekRecords.friday)} Vie: ${
          weekRecords.friday
        }\n`;
      }
      if (weekRecords.saturday > 0) {
        body += `  ${returnColorRanges(weekRecords.saturday)} Sab: ${
          weekRecords.saturday
        }\n`;
      }
      if (weekRecords.sunday > 0) {
        body += `  ${returnColorRanges(weekRecords.sunday)} Dom: ${
          weekRecords.sunday
        }`;
      }
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

export const weeklyReport = () => {
  console.log('Running weekly report messages');
  const today = new Date();
  Patient.find()
    .then((patients) => {
      patients.forEach((patient) => {
        if (patient.enabled) {
          Outcome.find({
            date: {
              $gt: new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate() - 7,
              ),
            },
            patientID: patient._id,
          })
            .then((outcomes) => {
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

              // Get average and count
              const [
                weekAverage,
                recordedCount,
                greenCount,
              ] = getAverageAndCounts(weekRecords);

              const message =
                patient.language.toLowerCase() === 'english'
                  ? getMessageTemplate(
                      greenCount,
                      recordedCount,
                      weekAverage,
                      weekRecords,
                      'english',
                    )
                  : getMessageTemplate(
                      greenCount,
                      recordedCount,
                      weekAverage,
                      weekRecords,
                      'spanish',
                    );
              const newMessage = new Message({
                patientID: new ObjectId(patient._id),
                phoneNumber: patient.phoneNumber,
                date: new Date(),
                message,
                sender: 'BOT',
                sent: false,
              });
              newMessage.save();
            })
            .catch((err) => console.log(err));
        }
      });
    })
    .catch((err) => console.log(err));
};

export const outreachNoResponseSendYES = async () => {
  const patients = await Patient.find({ enabled: true });
  const yesterday = new Date();
  yesterday.setHours(yesterday.getHours() - 24);

  patients.forEach(async (patient) => {
    if (patient.outreach.outreach && patient.outreach.lastDate < yesterday) {
      outreachMessage(patient, true);
    }
  });
};
