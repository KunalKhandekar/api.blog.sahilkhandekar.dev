/**
 * Node modules
 */
import { Schema, model, Types } from 'mongoose';

export interface IToken {
  token: string;
  userId: Types.ObjectId;
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
});

export default model<IToken>('Token', tokenSchema);
