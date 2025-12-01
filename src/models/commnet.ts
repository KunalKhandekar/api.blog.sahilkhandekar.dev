/**
 * Node modules
 */
import { Schema, model, Types } from 'mongoose';

export interface IComment {
  blogId: Types.ObjectId;
  userId: Types.ObjectId;
  content: string;
  likesCount: number;
}

const commentSchema = new Schema<IComment>(
  {
    blogId: {
      type: Schema.Types.ObjectId,
      ref: 'Blog',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      maxLength: [1000, 'Comment content must be less than 1000 characters']
    },
    likesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export default model<IComment>('Comment', commentSchema);
