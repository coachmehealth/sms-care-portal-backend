import mongoose from 'mongoose';

const { Schema } = mongoose;

interface IMessage extends mongoose.Document {
  _id: string;
  phoneNumber: string;
  patientID: number;
  sender: 'GLUCOSE BOT' | 'PATIENT';
  message: string;
  image: {
    data: Buffer;
    contentType: String;
  };
  date: Date;
  sent: Boolean;
  receivedWith: 'Glucose';
}

const MessageSchema = new Schema({
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
  receivedWith: { type: String, required: true, default: 'Glucose' },
});

const Message = mongoose.model<IMessage>('Message', MessageSchema);

export { Message, IMessage };
