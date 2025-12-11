/**
 * Node modules
 */
import { Schema, model, Types } from 'mongoose';

export interface IToken {
  token: string;
  userId: Types.ObjectId;
  createdAt?: Date;
}

const tokenSchema = new Schema<IToken>({
  token: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24 * 7,
  },
});

export default model<IToken>('Token', tokenSchema);
