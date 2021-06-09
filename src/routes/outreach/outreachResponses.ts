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
        'https://document-export.canva.com/79HiM/DAEg7J79HiM/2/thumbnail/0001-2639452354.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAQYCGKMUHWDTJW6UD%2F20210609%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20210609T145715Z&X-Amz-Expires=26385&X-Amz-Signature=867c82512440d24fd228e3d26e1772d95edd3cf01477724bb4b9d48a3869b02b&X-Amz-SignedHeaders=host&response-expires=Wed%2C%2009%20Jun%202021%2022%3A17%3A00%20GMT',
        'Want to join for FREE? Respond YES to get set up with your diabetes coach or MORE to learn more.',
      ];
    },
    spanish: (coach: string, name: string, clinic: string) => {
      return [
        `Hola, ${name} 😊, su equipo de salud de la Clínica ${clinic} le refirió para el programa Saludable en Casa. ¡Soy ${coach}, y me gustaría contarle más!`,
        'Vivir con Diabetes es agobiante. Le hace difícil tener la vida saludable, y sin-cuidados que merece.',
        'No está solo 🤝 . Saludable en Casa es un programa GRATIS de 12 semanas de coaching o consejería de diabetes, en su teléfono.',
        'https://document-export.canva.com/79HiM/DAEg7J79HiM/2/thumbnail/0001-2639452354.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAQYCGKMUHWDTJW6UD%2F20210609%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20210609T145715Z&X-Amz-Expires=26385&X-Amz-Signature=867c82512440d24fd228e3d26e1772d95edd3cf01477724bb4b9d48a3869b02b&X-Amz-SignedHeaders=host&response-expires=Wed%2C%2009%20Jun%202021%2022%3A17%3A00%20GMT',
        '¿Le gustaría unirse? Es GRATIS. Conteste SI para unirle a su coach o consejero de diabetes, o ponga MAS para aprender más 😊.',
      ];
    },
  },
  one: {
    english: () => {
      return [
        'Great! We’ve helped people like you manage their diabetes at home. See for yourself:',
        'https://images.squarespace-cdn.com/content/v1/5ce04d00b68cbf00010e0c76/1600802045596-CU5OJLB15MZJ7RHA9JDH/ke17ZwdGBToddI8pDm48kEpT_Wb2Q40Qb6WVkh_pUN4UqsxRUqqbr1mOJYKfIPR7LoDQ9mXPOjoJoqy81S2I8N_N4V1vUb5AoIIIbLZhVYy7Mythp_T-mtop-vrsUOmeInPi9iDjx9w8K4ZfjXt2duPVlUW5KossE0diiPzOT_7_ZXpOrcaDhMW_HAe3F34eCjLISwBs8eEdxAxTptZAUg/4.png?format=2500w',
        'https://images.squarespace-cdn.com/content/v1/5ce04d00b68cbf00010e0c76/1620158314094-I08MPXQHBBDBPXK5XQ9S/ke17ZwdGBToddI8pDm48kEpT_Wb2Q40Qb6WVkh_pUN4UqsxRUqqbr1mOJYKfIPR7LoDQ9mXPOjoJoqy81S2I8N_N4V1vUb5AoIIIbLZhVYy7Mythp_T-mtop-vrsUOmeInPi9iDjx9w8K4ZfjXt2duPVlUW5KossE0diiPzOT_7_ZXpOrcaDhMW_HAe3F34eCjLISwBs8eEdxAxTptZAUg/5.png?format=1500w',
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
        'https://slack-imgs.com/?c=1&o1=ro&url=https%3A%2F%2Fdocument-export.canva.com%2F_iu3o%2FDAEg0W_iu3o%2F3%2Fthumbnail%2F0001-2570826370.png%3FX-Amz-Algorithm%3DAWS4-HMAC-SHA256%26X-Amz-Credential%3DAKIAQYCGKMUHWDTJW6UD%252F20210608%252Fus-east-1%252Fs3%252Faws4_request%26X-Amz-Date%3D20210608T165537Z%26X-Amz-Expires%3D6830%26X-Amz-Signature%3Da09641b0941a0dac86c772cf4d5a97b30cb2842183fb2c7fa2d3726cf41dce5b%26X-Amz-SignedHeaders%3Dhost%26response-expires%3DTue%252C%252008%2520Jun%25202021%252018%253A49%253A27%2520GMT',
        'https://slack-imgs.com/?c=1&o1=ro&url=https%3A%2F%2Fdocument-export.canva.com%2FpADSs%2FDAEg0VpADSs%2F2%2Fthumbnail%2F0001-2570848775.png%3FX-Amz-Algorithm%3DAWS4-HMAC-SHA256%26X-Amz-Credential%3DAKIAQYCGKMUHWDTJW6UD%252F20210608%252Fus-east-1%252Fs3%252Faws4_request%26X-Amz-Date%3D20210608T020930Z%26X-Amz-Expires%3D59964%26X-Amz-Signature%3D70068d2ae9a73841cc35e796ed269f819436fe1eb7fe51f3ec53f7885903a345%26X-Amz-SignedHeaders%3Dhost%26response-expires%3DTue%252C%252008%2520Jun%25202021%252018%253A48%253A54%2520GMT',
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
  imageURL?: string,
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
    image: {
      hostedLink: imageURL,
    },
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
  if (
    patient.outreach.yes === false &&
    moreMessage === false &&
    yesMessage === false
  ) {
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
    await sendMessageMinutesFromNow(3, patient, response[2], response[3]);
    await sendMessageMinutesFromNow(4, patient, response[4]);

    await Patient.findOneAndUpdate(
      { _id: patient._id },
      {
        outreach: {
          outreach: true,
          more: false,
          yes: false,
          lastMessageSent: '0',
          messageCount: patient.outreach.messageCount + 1,
          lastDate: new Date(),
          pending: true,
        },
      },
    );
  }

  if (
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
          lastMessageSent: '1',
          lastDate: new Date(),
          messageCount: patient.outreach.messageCount + 1,
          pending: true,
        },
      },
    );
  }

  if (
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
          lastMessageSent: '2',
          lastDate: new Date(),
          messageCount: patient.outreach.messageCount + 1,
          pending: true,
        },
      },
    );
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
          messageCount: patient.outreach.messageCount + 1,
          pending: true,
        },
      },
    );
  }

  return [''];
};
