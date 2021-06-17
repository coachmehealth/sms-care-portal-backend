import mongoose from 'mongoose';

const { Schema } = mongoose;

interface ISchedule extends mongoose.Document {
  _id: string;
  weeklyReport: Date;
}

const ScheduleSchema = new Schema({
  weeklyReport: { type: Date, required: true },
});

const Schedule = mongoose.model<ISchedule>('Schedule', ScheduleSchema);

export { Schedule, ISchedule };
