/* eslint-disable @typescript-eslint/indent */
import { Patient, IPatient } from '../../models/patient.model';
import { Message } from '../../models/message.model';

type SupportedLanguage = 'english' | 'spanish';

export const DefaultResponses = {
  zero: {
    english: (coach: string, name: string, clinic: string) => {
      return [
        `Hi ${name}, your team at ${clinic} 🏥 referred you to join the Healthy At Home Program. This is ${coach} and I can tell you more.`,
        'Diabetes is overwhelming. It can keep you from the long, worry-free life you deserve.',
        'You’re not alone 🤝 Healthy at Home is a FREE 12-week diabetes coaching program on your phone 📱',
        'Want to join for FREE? Respond YES to get set up with your diabetes coach or MORE to learn more.',
      ];
    },
    spanish: (coach: string, name: string, clinic: string) => {
      return [
        `Hola, ${name} 😊, su equipo de salud de la Clínica ${clinic} le refirió para el programa Saludable en Casa. ¡Soy ${coach}, y me gustaría contarle más!`,
        'Vivir con Diabetes es agobiante. Le hace difícil tener la vida saludable, y sin-cuidados que merece.',
        'No está solo 🤝 . Saludable en Casa es un programa GRATIS de 12 semanas de coaching o consejería de diabetes, en su teléfono.',
        '¿Le gustaría unirse? Es GRATIS. Conteste SI para unirle a su coach o consejero de diabetes, o ponga MAS para aprender más 😊.',
      ];
    },
  },
  one: {
    english: () => {
      return [
        'Great! We’ve helped people like you manage their diabetes at home. See for yourself:',
        '[IMAGEN]',
        '[IMAGEN]',
        `Here’s how it works
        1. We call you to tell you more
        2. Schedule a visit
        3. Start feeling great!
        `,
        'Ready to start? Respond YES to get set up with your diabetes coach or MORE to learn more',
      ];
    },
    spanish: () => {
      return [
        'Bien! Hemos ayudado a mucha gente como usted a mejorar y manejar su diabetes en casa, por telefono. Vealo por usted mismo:',
        '[IMAGEN]',
        '[IMAGEN]',
        `Así es como funciona:
        1. Le llamamos para contarle más
        2. Programe una llamada con su coach
        3. Empiece a sentirse mejor
        `,
        '¿Listo para comenzar? Conteste SI para unirle a su coach de diabetes o MÁS para más información.',
      ];
    },
  },
  two: {
    english: () => {
      return [
        'Wonderful! This valuable program is FREE to you and it’s starting now, so don’t miss out!',
        'We want you to know you can stop ✋ if you need and it works on any phone 📱.',
        `Give it a try ✨
        Respond YES to get set up with your diabetes coach or to learn more.
        `,
      ];
    },
    spanish: () => {
      return [
        '¡Fabuloso! Este programa es GRATUITO y muy valioso. ¡Comience pronto, no pierda la oportunidad!',
        'Quiero que sepa que funciona desde cualquier teléfono, y puede parar ✋ si lo necesita.',
        `Pruébelo ✨
        Responda SI para unirle a su coach de Diabetes, o MÁS para más información.
        `,
      ];
    },
  },
  yes: {
    english: () => {
      return [
        'Welcome to Healthy at Home! By joining, you’ve taken step 1️⃣ for your health. 💪',
      ];
    },
    spanish: () => {
      return [
        'Bienvenido a Salud en casa! Al unirte has tomado el paso 1️⃣ para tu salud. 💪',
      ];
    },
  },
};

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
    patientID: patient._id,
    message,
    sender: 'Outreach',
    date: todayPlusMinutes,
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

export const outreachMessage = async (
  patient: IPatient,
  yesMessage?: boolean,
  moreMessage?: boolean,
): Promise<string[]> => {
  const language = responseLanguage(patient.language);
  if (patient.outreach.lastMessageSent === '0') {
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
          more: false,
          yes: false,
          lastMessageSent: '1',
          lastDate: new Date(),
        },
      },
    );
  }

  if (
    patient.outreach.lastMessageSent === '1' &&
    patient.outreach.yes === false &&
    moreMessage === true &&
    yesMessage === false
  ) {
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
          more: true,
          yes: false,
          lastMessageSent: '2',
          lastDate: new Date(),
        },
      },
    );
  }

  if (
    patient.outreach.lastMessageSent === '2' &&
    patient.outreach.yes === false &&
    moreMessage === true &&
    patient.outreach.more === true &&
    yesMessage === false
  ) {
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
          more: true,
          yes: false,
          lastMessageSent: '3',
          lastDate: new Date(),
        },
      },
    );
  }

  if (
    patient.outreach.lastMessageSent === '3' &&
    patient.outreach.yes === false &&
    yesMessage === false
  ) {
    const response =
      language === 'english'
        ? DefaultResponses.two.english()
        : DefaultResponses.two.spanish();

    await sendMessageMinutesFromNow(3, patient, response[2]);
  }

  if (yesMessage) {
    const response =
      language === 'english'
        ? DefaultResponses.yes.english()
        : DefaultResponses.yes.spanish();

    await sendMessageMinutesFromNow(1, patient, response[0]);

    await Patient.findOneAndUpdate(
      { _id: patient._id },
      {
        outreach: {
          outreach: false, // Because outreach has been completed
          more: patient.outreach.more,
          yes: true,
          lastMessageSent: 'yes',
          lastDate: new Date(),
        },
      },
    );
  }

  return [''];
};
