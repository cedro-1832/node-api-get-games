const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const helmet = require('helmet');
const cors = require('cors');

const gameRoutes = require('./routes/gameRoutes');
const authRoutes = require('./routes/authRoutes');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const app = express();
let PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(helmet());
app.use(cors({ origin: "http://localhost:3000" }));

app.use('/api/games', gameRoutes);
app.use('/api/auth', authRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Verificar si el puerto está libre antes de iniciarlo
const server = app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`⚠️  Puerto ${PORT} en uso, intentando con otro...`);
        PORT++;
        app.listen(PORT, () => {
            console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
        });
    } else {
        console.error(`❌ Error al iniciar el servidor: ${err.message}`);
    }
});
