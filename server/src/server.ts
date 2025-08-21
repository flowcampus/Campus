import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import schoolRoutes from './routes/school';
import dashboardRoutes from './routes/dashboard';
import healthRouter from './routes/health';
import prisma from './lib/prisma';
import { hashPassword } from './utils/password';
import studentsRouter from './routes/students';
import teachersRouter from './routes/teachers';
import classesRouter from './routes/classes';
import schoolsPublicRoutes from './routes/schools';

const app = express();

// Configure CORS from environment
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow same-origin or non-browser requests (no origin header)
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS: Origin not allowed: ${origin}`));
    },
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

// Root status route to confirm server is reachable
app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'Campus API', version: '1.0.0' });
});

app.use('/api/health', healthRouter);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/school', schoolRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/schools', schoolsPublicRoutes);

const PORT = process.env.PORT || 5001;

async function bootstrap() {
  // Seed default School and Super Admin if missing
  const superEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@campus.com';
  const superPassword = process.env.SUPER_ADMIN_PASSWORD || 'ChangeMe_SuperAdmin_!2025';

  let school = await prisma.school.findFirst();
  if (!school) {
    school = await prisma.school.create({ data: { name: 'Default School', code: 'CAMPUS-DEFAULT' } });
  }

  const admin = await prisma.user.findUnique({ where: { email: superEmail } });
  if (!admin) {
    const passwordHash = await hashPassword(superPassword);
    await prisma.user.create({
      data: {
        email: superEmail,
        password: passwordHash,
        firstName: 'Super',
        lastName: 'Admin',
        role: 'admin',
        schoolId: school.id,
      },
    });
    // eslint-disable-next-line no-console
    console.log('Seeded Super Admin and default School');
  }
}

app.listen(PORT, async () => {
  try {
    await bootstrap();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Bootstrap failed, continuing to serve API:', err);
  }
  // eslint-disable-next-line no-console
  console.log(`Server running on http://localhost:${PORT}`);
});

// Basic error handler to avoid connection resets without response
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Avoid process exit on unhandled errors; log and keep serving
process.on('unhandledRejection', (reason) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  // eslint-disable-next-line no-console
  console.error('Uncaught Exception:', err);
});
