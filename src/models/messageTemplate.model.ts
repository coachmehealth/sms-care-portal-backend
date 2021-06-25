import mongoose from 'mongoose';

const { Schema } = mongoose;

interface IMesssageTemplate extends mongoose.Document {
  _id: string;
  text: string;
  language: string;
  type: string;
}

const MessageTemplateSchema = new Schema({
  text: { type: String, required: true },
  language: { type: String, required: true },
  type: { type: String, required: true },
});

const MessageTemplate = mongoose.model<IMesssageTemplate>(
  'MessageTemplate',
  MessageTemplateSchema,
);

export { MessageTemplate, IMesssageTemplate };
