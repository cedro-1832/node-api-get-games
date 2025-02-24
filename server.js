const express = require('express');
const serverless = require('serverless-http');
const dotenv = require('dotenv');
dotenv.config();
const helmet = require('helmet');
const cors = require('cors');

const gameRoutes = require('./routes/gameRoutes');
const authRoutes = require('./routes/authRoutes');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const app = express();

app.use(express.json());
app.use(helmet());
app.use(cors({ origin: "*" }));

app.use('/api/games', gameRoutes);
app.use('/api/auth', authRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

exports.handler = serverless(app);
