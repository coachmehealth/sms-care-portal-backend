import mongoose from 'mongoose';

const { Schema } = mongoose;

interface IMesssageTemplate extends mongoose.Document {
  _id: string;
  text: string;
  language: string;
  type: string;
  creator: string;
  public: boolean;
  media?: string;
}

const MessageTemplateSchema = new Schema({
  text: { type: String, required: true },
  language: { type: String, required: true },
  type: { type: String, required: true },
  creator: { type: String, required: true },
  public: { type: Boolean, required: true },
  media: { type: String, required: false },
});

const MessageTemplate = mongoose.model<IMesssageTemplate>(
  'MessageTemplate',
  MessageTemplateSchema,
);

export { MessageTemplate, IMesssageTemplate };
