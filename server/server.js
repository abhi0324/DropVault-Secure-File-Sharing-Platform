import express from 'express';
import router from './routes/routes.js';
import DBconnection from './database/db.js';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.set('trust proxy', true);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = (process.env.CORS_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean);
app.use(cors({ 
    origin: allowedOrigins.length ? allowedOrigins : '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use('/', router);

DBconnection();
 
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});