import mongoose from 'mongoose';

const { Schema } = mongoose;

interface IOutcome extends mongoose.Document {
  _id: string;
  patientID: number;
  phoneNumber: string;
  date: Date;
  response: string;
  value: number;
  alertType: string;
}

const OutcomeSchema = new Schema({
  patientID: { type: mongoose.Schema.Types.ObjectId, required: true },
  phoneNumber: { type: String, required: true },
  date: { type: Date, required: true },
  response: { type: String, required: true },
  value: { type: Number, required: false },
  alertType: { type: String, required: false },
});

const Outcome = mongoose.model<IOutcome>('Outcome', OutcomeSchema);

export { Outcome, IOutcome };
