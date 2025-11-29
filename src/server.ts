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
      console.log(`CORS error: ${origin} is not allowed by CORS`);
    }
  },
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

(async () => {
  try {
    app.get('/', (req, res) => {
      res.json({
        message: 'Hello world',
      });
    });

    app.listen(config.PORT, () => {
      console.log(`Server is running: http://localhost:${config.PORT}`);
    });
  } catch (error) {
    console.log('Falied to start the server', error);
    if (config.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
})();
