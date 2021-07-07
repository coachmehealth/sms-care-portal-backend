import { PatientForPhoneNumber } from '../../models/patient.model';
import outreachMessage from './outreachResponses';

const sendOutreachMessages = async (phoneNumber: string) => {
  const patient = await PatientForPhoneNumber(phoneNumber);
  if (
    patient?.outreach.outreach &&
    patient?.enabled &&
    !patient?.outreach.complete
  ) {
    await outreachMessage(patient);
  }
};

export default sendOutreachMessages;
