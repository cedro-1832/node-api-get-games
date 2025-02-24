const express = require('express');
const serverless = require('serverless-http');
const dotenv = require('dotenv');
dotenv.config();
const helmet = require('helmet');
const cors = require('cors');

const gameRoutes = require('./routes/gameRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(express.json());
app.use(helmet());
app.use(cors({ origin: "*" }));

// Base Path de API Gateway
const BASE_PATH = process.env.BASE_PATH || '/dev';

// Configuración de rutas
app.use(`${BASE_PATH}/api/games`, gameRoutes);
app.use(`${BASE_PATH}/api/auth`, authRoutes);
app.use(`${BASE_PATH}/api-docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Exportar handler de Lambda
module.exports.handler = serverless(app);
