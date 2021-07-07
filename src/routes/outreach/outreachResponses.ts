import { ObjectId } from 'mongodb';
import { Message } from '../../models/message.model';
import { Patient, IPatient } from '../../models/patient.model';
import DefaultResponses from './defaultResponses';

type SupportedLanguage = 'english' | 'spanish';

const sendMessageMinutesFromNow = async (
  minutes: number,
  patient: IPatient,
  message: string,
) => {
  const todayPlusMinutes = new Date();
  todayPlusMinutes.setMinutes(todayPlusMinutes.getMinutes() + minutes);
  const newMessage = new Message({
    sent: false,
    phoneNumber: patient.phoneNumber,
    patientID: new ObjectId(patient._id),
    message,
    sender: 'OUTREACH',
    date: todayPlusMinutes,
    isGeneralNumber: true,
  });

  await newMessage.save();
};

const responseLanguage = (language?: string): SupportedLanguage => {
  if (!language) {
    return 'english';
  }
  const cleanLanguage = language.toLowerCase();

  if (cleanLanguage === 'english' || cleanLanguage === 'spanish') {
    return cleanLanguage;
  }

  return 'english';
};

const outreachMessage = async (
  patient: IPatient,
  yesMessage: boolean = false,
): Promise<string[]> => {
  const language = responseLanguage(patient.language);
  if (patient.outreach.lastMessageSent === '0' && !yesMessage) {
    const response =
      language === 'english'
        ? DefaultResponses.zero.english(
          patient.coachName,
          patient.firstName,
          patient.clinic,
        )
        : DefaultResponses.zero.spanish(
          patient.coachName,
          patient.firstName,
          patient.clinic,
        );
    await sendMessageMinutesFromNow(1, patient, response[0]);
    await sendMessageMinutesFromNow(2, patient, response[1]);
    await sendMessageMinutesFromNow(3, patient, response[2]);
    await sendMessageMinutesFromNow(4, patient, response[3]);

    await Patient.findOneAndUpdate(
      { _id: patient._id },
      {
        outreach: {
          outreach: true,
          yes: false,
          complete: false,
          lastMessageSent: '1',
          lastDate: new Date(),
        },
      },
    );
  } else if (patient.outreach.lastMessageSent === '1' && !yesMessage) {
    const response =
      language === 'english'
        ? DefaultResponses.one.english()
        : DefaultResponses.one.spanish();

    await sendMessageMinutesFromNow(1, patient, response[0]);
    await sendMessageMinutesFromNow(2, patient, response[1]);
    await sendMessageMinutesFromNow(3, patient, response[2]);
    await sendMessageMinutesFromNow(4, patient, response[3]);
    await sendMessageMinutesFromNow(5, patient, response[4]);

    await Patient.findOneAndUpdate(
      { _id: patient._id },
      {
        outreach: {
          outreach: true,
          yes: false,
          complete: false,
          lastMessageSent: '2',
          lastDate: new Date(),
        },
      },
    );
  } else if (patient.outreach.lastMessageSent === '2' && !yesMessage) {
    const response =
      language === 'english'
        ? DefaultResponses.two.english()
        : DefaultResponses.two.spanish();

    await sendMessageMinutesFromNow(1, patient, response[0]);
    await sendMessageMinutesFromNow(2, patient, response[1]);
    await sendMessageMinutesFromNow(3, patient, response[2]);

    await Patient.findOneAndUpdate(
      { _id: patient._id },
      {
        outreach: {
          outreach: true,
          yes: false,
          complete: false,
          lastMessageSent: '3',
          lastDate: new Date(),
        },
      },
    );
  } else if (yesMessage || patient.outreach.lastMessageSent === '3') {
    const response =
      language === 'english'
        ? DefaultResponses.yes.english()
        : DefaultResponses.yes.spanish();

    await sendMessageMinutesFromNow(1, patient, response[0]);

    await Patient.findOneAndUpdate(
      { _id: patient._id },
      {
        outreach: {
          outreach: true,
          yes: true,
          complete: false,
          lastMessageSent: 'yes',
          lastDate: new Date(),
        },
      },
    );
  }

  return [''];
};

export default outreachMessage;
