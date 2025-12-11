/**
 * Node Modules
 */
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';

/**
 * Custom modules
 */
import config from '@/config';
import limiter from '@/lib/express_rate_limit';
import { connectToDatabase, disconnectFromDatabase } from '@/lib/mongoose';
import { logger, logtail } from '@/lib/winston';
import agenda from '@/lib/agenda';
import { defineJobs } from '@/jobs';

/**
 * Router
 */
import v1Routes from '@/routes/v1';

/**
 * Types
 */
import type { CorsOptions } from 'cors';

/**
 * Express app initial
 */
const app = express();

// Configure CORS options
const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (
      config.NODE_ENV === 'development' ||
      !origin ||
      config.WHITELIST_ORIGINS.includes(origin)
    ) {
      callback(null, true);
    } else {
      // Reject request from non-whitelisted origins
      callback(
        new Error(`CORS error: ${origin} is not allowed by CORS`),
        false,
      );
      logger.warn(`CORS error: ${origin} is not allowed by CORS`);
    }
  },
  credentials: true,
};

// CORS middleware
app.use(cors(corsOptions));

// Enable JSON request body parsing
app.use(express.json());

// Enable URL-encoded request body parsing with extended mode
// `extended: true` allows rich objects and array via querystring library
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// Enable response compression to reduce payload size and improve performance
app.use(
  compression({
    threshold: 1024, // only compress response larger than 1KB
  }),
);

// Enhance security by setting various HTTP headers
app.use(helmet());

// Rate limit middleware to prevent excessive requests and enhance security
app.use(limiter);

/**
 * Immeidately Invoked Async Function Expression (IIFE) to start the server.
 *
 * - Tries to connect to the database before initializing the server.
 * - Defines the API routes (/api/v1).
 * - Starts the server on the specified PORT and logs the running URL.
 * - If an error occurs during the startup, it is logged, and the process exits with status 1.
 */
(async () => {
  try {
    await connectToDatabase();

    // Initialize and start Agenda
    defineJobs();
    await agenda.start();
    logger.info('Agenda started!');

    app.use('/api/v1', v1Routes);

    app.listen(config.PORT, () => {
      logger.info(`Server is running: http://localhost:${config.PORT}`);
    });
  } catch (error) {
    logger.error('Falied to start the server', error);
    if (config.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
})();

/**
 * Handles server shutdown gracefully by disconnecting from the database
 *
 * - Attemspts to disconnect from the database before shutting down the server.
 * - Logs a success message upon successful disconnection.
 * - If an error occurs during disconnection, it is logged to the console.
 * - Exits the process with status 0 (Indicates successful termination).
 */
const handleServerShutdown = async () => {
  try {
    await disconnectFromDatabase();
    logger.warn('Server SHUTDOWN');
    await logtail.flush(); // Ensure all the logs are sent before exiting
    process.exit(0);
  } catch (error) {
    logger.error('Error during server shutdown', error);
  }
};

/**
 * Listens for termination signals (`SIGTERM` and `SIGINT`)
 *
 * - `SIGTERM` is typically sent when stopping a process (e.g., 'kill' command or container shutdown)
 * - `SIGINT` is triggered when the user interrupts the process (e.g., pressing `Ctrl + c`)
 * - when either signal is received, `handleServerShutdown` is executed to ensure proper cleanup
 */
process.on('SIGTERM', handleServerShutdown);
process.on('SIGINT', handleServerShutdown);
