import mongoose from 'mongoose';

const { Schema } = mongoose;

interface IPatient extends mongoose.Document {
  _id: string;
  firstName: string;
  lastName: string;
  coachID: string;
  coachName: string;
  language: string;
  phoneNumber: string;
  prefTime: number;
  messagesSent: number;
  responseCount: number;
  reports: [
    {
      data: Buffer;
      contentType: String;
    },
  ];
  enabled: boolean;
  clinic: string;
  outreach: {
    outreach: boolean;
    yes: boolean;
    complete: boolean;
    lastMessageSent: string;
    lastDate: Date;
  };
}

const PatientSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  coachID: { type: mongoose.Schema.Types.ObjectId },
  coachName: { type: String, required: true },
  language: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  prefTime: { type: Number, required: true },
  messagesSent: { type: Number, required: true },
  responseCount: { type: Number, required: true },
  reports: [
    {
      data: { type: Buffer, required: true },
      contentType: { type: String, required: true },
    },
  ],
  enabled: { type: Boolean, required: true },
  clinic: { type: String, required: true, default: 'CoachMe' },
  outreach: {
    outreach: { type: Boolean, required: true, default: false },
    yes: { type: Boolean, required: true, default: false },
    complete: { type: Boolean, required: true, default: false },
    lastMessageSent: { type: String, required: true, default: '0' },
    lastDate: { type: Date, required: true, default: new Date() },
  },
});

const Patient = mongoose.model<IPatient>('Patient', PatientSchema);

const PatientForPhoneNumber = async (
  phoneNumber: string,
): Promise<IPatient | null> => {
  return Patient.findOne({ phoneNumber });
};

export { Patient, PatientForPhoneNumber, IPatient };
