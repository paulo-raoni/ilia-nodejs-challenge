import Fastify from 'fastify';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import { mustGetEnv, parseBearer, Errors, logger } from '@ilia/shared';

import { createDbPool } from './config/db.js';
import { runMigrations } from './infra/db/migrate.js';
import { transactionsRepository } from './infra/repositories/transactionsRepository.js';

import { createTransactionUseCase } from './application/usecases/createTransaction.js';
import { listTransactionsUseCase } from './application/usecases/listTransactions.js';
import { getBalanceUseCase } from './application/usecases/getBalance.js';

import { registerRoutes } from './http/routes.js';

import { waitForDb } from '@ilia/shared/src/waitForDb.js';


dotenv.config();

const port = Number(process.env.TRANSACTIONS_PORT || 3001);
const externalSecret = mustGetEnv('JWT_EXTERNAL_SECRET');

const app = Fastify({ logger: false });

// Error handler padrão
app.setErrorHandler((err, req, reply) => {
  const status = err.statusCode || 500;
  reply.status(status).send({
    error: err.code || 'INTERNAL_ERROR',
    message: err.message || 'Internal Server Error',
  });
});

// Auth em todas as rotas (como o YAML exige)
app.addHook('onRequest', async (req) => {
  const token = parseBearer(req.headers.authorization);
  if (!token) throw Errors.unauthorized('Missing Bearer token');

  try {
    const payload = jwt.verify(token, externalSecret);
    // Esperado: payload.sub = user_id
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

  const repo = transactionsRepository(pool);

  const deps = {
    createTransaction: createTransactionUseCase(repo),
    listTransactions: listTransactionsUseCase(repo),
    getBalance: getBalanceUseCase(repo),
  };

  // Sanity check (mantém)
  app.get('/status', async () => ({ ok: true, service: 'transactions' }));

  // Rotas do YAML
  await registerRoutes(app, deps);

  // Fechamento gracioso
  app.addHook('onClose', async () => {
    await pool.end();
  });

  await app.listen({ port, host: '0.0.0.0' });
  logger.info(`transactions listening on ${port}`);
}

bootstrap().catch((e) => {
  logger.error(e);
  process.exit(1);
});
