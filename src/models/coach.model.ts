import mongoose from 'mongoose';

const { Schema } = mongoose;

interface ICoach extends mongoose.Document {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  refreshToken: string;
}

const CoachSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  refreshToken: { type: String, required: false },
});

const Coach = mongoose.model<ICoach>('Coach', CoachSchema);

export { Coach, ICoach };
