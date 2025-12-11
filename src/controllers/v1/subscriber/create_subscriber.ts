/**
 * Custom Modules
 */
import { SEND_WELCOME_EMAIL_JOB } from '@/jobs/welcome_subscriber';
import agenda from '@/lib/agenda';
import { logger } from '@/lib/winston';

/**
 * Models
 */
import Subscriber from '@/models/subscriber';

/**
 * Types
 */
import type { Request, Response } from 'express';

export const createSubscriber = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email } = req.body;
    const existingSubscriber = await Subscriber.findOne({ email })
      .lean()
      .exec();

    if (existingSubscriber) {
      res.status(409).json({
        code: 'ConflictError',
        message: 'Subscriber with this email already exists',
      });
      return;
    }
    const newSubscriber = await Subscriber.create({ email });
    await newSubscriber.save();

    await agenda.now(SEND_WELCOME_EMAIL_JOB, { email: newSubscriber.email });

    res.status(201).json({
      message: 'Subscriber created successfully',
      subscriber: newSubscriber,
    });
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: error,
    });

    logger.error('Error during subscriber creation', error);
  }
};
