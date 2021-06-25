import mongoose from 'mongoose';

const { Schema } = mongoose;

interface IMessageGeneral extends mongoose.Document {
  _id: string;
  phoneNumber: string;
  patientID: number;
  sender: 'COACH' | 'PATIENT' | 'OUTREACH';
  message: string;
  image: {
    data: Buffer;
    contentType: String;
  };
  date: Date;
  sent: Boolean;
  receivedWith: 'General';
}

const MessageGeneralSchema = new Schema({
  patientID: { type: mongoose.Schema.Types.ObjectId, required: true },
  phoneNumber: { type: String, required: true },
  message: { type: String, required: true },
  sender: { type: String, required: true },
  image: {
    data: { type: mongoose.Schema.Types.Buffer, required: false },
    contentType: { type: String, required: false },
  },
  date: { type: mongoose.Schema.Types.Date, required: true },
  sent: { type: mongoose.Schema.Types.Boolean, default: false },
  receivedWith: { type: String, required: true, default: 'General' },
});

const MessageGeneral = mongoose.model<IMessageGeneral>(
  'MessageGeneral',
  MessageGeneralSchema,
);

export { MessageGeneral, IMessageGeneral };
