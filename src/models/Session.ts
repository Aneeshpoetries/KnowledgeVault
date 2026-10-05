import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  email: string;
  role: string;
  expiresAt: Date;
  createdAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    token: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true },
    role: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } }, // TTL index
  },
  { timestamps: true }
);

const SessionModel: Model<ISession> =
  (mongoose.models.Session as Model<ISession>) ||
  mongoose.model<ISession>('Session', SessionSchema);

export default SessionModel;
