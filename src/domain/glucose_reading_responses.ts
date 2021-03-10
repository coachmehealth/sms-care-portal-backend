import { capitalize, sample } from 'lodash';
import { MessageTemplate } from '../models/messageTemplate.model';
import { ParsedMessage } from './message_parsing';

type SupportedLanguage = 'english' | 'spanish';

export const DefaultResponses = {
  catchall: {
    english:
      'Hi, this is the automated blood glucose tracker. Please send a number in your message for us to track your sugar. If you wish to reach your coach text them at (650) 534-0331. Thanks!',
    spanish:
      'Hola, este es el monitoreo automatizado de glucosa. Favor envianos tu nivel de azucar en el mensaje, para agregarlo a tus datos. Si quieres hablar con tu consejero de salud, enviale un texto al (650) 534-0331. Gracias!',
  },
  no_from_patient: {
    english:
      'Hi, were you able to measure your sugar today? If you need any help with measuring your sugar, please tell your coach.',
    spanish:
      'Hola, pudiste revisar tu azucar hoy? Si necesitas ayuda revisando tu azucar, por favor dile a tu consejero de salud.',
  },
  too_many_readings: {
    english:
      'Hi, it looks like you sent more than one number. Please send one number in each message.',
    spanish:
      'Hola! Veo que enviaste varios numeros. Favor envianos un numero por mensaje.',
  },
  '<70': {
    english:
      'Your measurement is less than 70. A level less than 70 is low and can harm you. \nTo raise your sugar levels, we recommend you eat or drink sugar now. Try fruit juice with sugar, sugary soda, eat four pieces of candy with sugar. \nAfter 15 minutes, check your sugar levels and text us your measurement. \nIf you continue to measure less than 70, seek urgent medical help.',
    spanish:
      'Tu medida de azucar es menor a 70. Un nivel menor a 70 es bajo, y puede perjudicar tu salud.\nRecomendamos tomar o comer algo azucarado ahora mismo, para ayudar a elevar tu nivel de azucar.\nDentro de 15 minutos, favor revisa tu nivel de azucar de nuevo, y envianos tu numero.\nSi tu medida de azucar aun esta abajo de 70, busca ayuda medica urgentemente.',
  },
  '<80': {
    english:
      'Thank you! How are you feeling? If you feel - sleepy, sweaty, pale, dizzy, irritable, or hungry - your sugar may be too low.\nPlease consume sugar (like juice) to raise your sugars to 80 or above.',
    spanish:
      'Gracias! Como te sientes? Si te sientes: sudoroso, con sueno, palido, mareado, enojado o hambriento - tu azucar puede estar muy baja.',
  },
  green: {
    english: 'Congratulations! You’re in the green today - keep it up!',
    spanish: 'Felicidades! 🎉 Estas en el verde hoy - sigue asi!',
  },
  yellow: {
    english:
      'Thank you! You’re in the yellow today - what is one thing you can do to help you lower your glucose levels for tomorrow?',
    spanish:
      'Gracias! Estas en el amarillo 🟡  hoy - cual seria una cosa que podrias hacer para bajar tus niveles de glucosa de mañana? 🤔',
  },
  red: {
    english:
      'Thank you! You’re in the red today - your sugars are high. What can you do to lower your number for tomorrow??',
    spanish:
      'Gracias por compartir. Estas en el rojo 🔴 hoy, pero lo importante es continuar trabajando duro en tus metas de salud 💪🏻. Tu puedes!',
  },
  '>300': {
    english:
      'Your measurement is over 300. Fasting blood glucose levels of 300 or more can be dangerous.\nIf you have two readings in a row of 300 or more or are worried about how you feel, call your doctor.',
    spanish:
      'Tu medida esta por encima de 300. Niveles de glucosa de 300, o arriba, pueden ser peligrosos. Si tienes dos numeros seguidos, arriba de 300, o estas preocupado/a de como te sientes, llama a tu doctor.',
  },
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

export const responseForParsedMessage = async (
  parsedMessage: ParsedMessage,
  language?: string,
): Promise<string> => {
  const lang = responseLanguage(language);

  if (parsedMessage.error) {
    return DefaultResponses[parsedMessage.error][lang];
  }

  const classification = parsedMessage.glucoseReading?.classification;
  if (!classification) {
    return DefaultResponses.catchall[lang];
  }

  const templates = await MessageTemplate.find({
    language: capitalize(lang),
    type: capitalize(classification),
  });

  console.log('Got message templates from DB = ', templates);

  const randomTemplate = sample(templates);

  if (!randomTemplate) {
    return DefaultResponses[classification][lang];
  }

  return randomTemplate.text;
};
