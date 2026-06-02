import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import herbsRouter from './routes/herbs';
import authRouter from './routes/auth';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

const uploadDir = process.env.UPLOAD_DIR || './uploads';
app.use('/uploads', express.static(path.resolve(uploadDir)));

app.use('/api/herbs', herbsRouter);
app.use('/api/auth', authRouter);

app.listen(PORT, () => {
  console.log(`🌿 Flora Codex API запущен на порту ${PORT}`);
});
