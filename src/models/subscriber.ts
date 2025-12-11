/**
 * Node modules
 */
import { model, Schema } from 'mongoose';

export interface ISubscriber {
  email: string;
  createdAt: Date;
}

const subscriberSchema = new Schema<ISubscriber>({
  email: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default model<ISubscriber>('Subscriber', subscriberSchema);
