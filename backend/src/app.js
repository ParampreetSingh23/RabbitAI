require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const uploadRoutes = require('./routes/upload.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security
app.use(helmet());

// CORS — whitelist frontend URL
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:80',
  'http://localhost',
];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow localhost, any IP address (like EC2), and the frontend URL
      if (
        !origin || 
        allowedOrigins.includes(origin) || 
        /^http:\/\/localhost(:\d+)?$/.test(origin) ||
        /^http:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger
const swaggerDocument = YAML.load(path.join(__dirname, 'config/swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Routes
app.use('/api', uploadRoutes);

// Global error handler
app.use(errorHandler);

module.exports = app;
