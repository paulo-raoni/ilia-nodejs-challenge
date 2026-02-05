import Fastify from 'fastify';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import { mustGetEnv, parseBearer, Errors, logger } from '@ilia/shared';
import { waitForDb } from '@ilia/shared';

import { createDbPool } from './config/db.js';
import { runMigrations } from './infra/db/migrate.js';
import { usersRepository } from './infra/repositories/usersRepository.js';

import { createUserUseCase } from './application/usecases/createUser.js';
import { authUserUseCase } from './application/usecases/authUser.js';
import { listUsersUseCase } from './application/usecases/listUsers.js';
import { getUserUseCase } from './application/usecases/getUser.js';
import { updateUserUseCase } from './application/usecases/updateUser.js';
import { deleteUserUseCase } from './application/usecases/deleteUser.js';

import { registerRoutes } from './http/routes.js';

dotenv.config();

const port = Number(process.env.USERS_PORT || 3002);
const externalSecret = mustGetEnv('JWT_EXTERNAL_SECRET');

const app = Fastify({ logger: false });

/**
 * Error handler padrão
 */
app.setErrorHandler((err, req, reply) => {
  const status = err.statusCode || 500;
  reply.status(status).send({
    error: err.code || 'INTERNAL_ERROR',
    message: err.message || 'Internal Server Error',
  });
});

/**
 * Public routes (no external JWT required)
 */
function isPublicRoute(req) {
  const url = req.url || '';
  if (req.method === 'POST' && url.startsWith('/users')) return true;
  if (req.method === 'POST' && url.startsWith('/auth')) return true;
  return false;
}

/**
 * External JWT auth (default for all routes)
 */
app.addHook('onRequest', async (req) => {
  if (isPublicRoute(req)) return;

  const token = parseBearer(req.headers.authorization);
  if (!token) throw Errors.unauthorized('Missing Bearer token');

  try {
    const payload = jwt.verify(token, externalSecret);
    if (!payload?.sub) throw new Error('missing sub');
    req.user = payload;
  } catch {
    throw Errors.unauthorized('Invalid token');
  }
});

async function bootstrap() {
  const pool = createDbPool();

  await waitForDb(pool, { retries: 30, delayMs: 500 });
  await runMigrations(pool);

  const repo = usersRepository(pool);

  const deps = {
    createUser: createUserUseCase(repo),
    authUser: authUserUseCase(repo),
    listUsers: listUsersUseCase(repo),
    getUser: getUserUseCase(repo),
    updateUser: updateUserUseCase(repo),
    deleteUser: deleteUserUseCase(repo),
  };

  await registerRoutes(app, deps);

  app.addHook('onClose', async () => {
    await pool.end();
  });

  await app.listen({ port, host: '0.0.0.0' });
  logger.info(`users listening on ${port}`);
}

bootstrap().catch((e) => {
  logger.error(e);
  process.exit(1);
});
