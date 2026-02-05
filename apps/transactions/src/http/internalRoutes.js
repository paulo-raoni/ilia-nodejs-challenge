import { z } from 'zod';
import { Errors } from '@ilia/shared';

export async function registerInternalRoutes(app, deps) {
  const { getBalanceByUserId, verifyInternalJwt } = deps;

  app.addHook('preHandler', async (req) => {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) throw Errors.unauthorized('Missing token');

    const token = auth.slice('Bearer '.length);
    try {
      verifyInternalJwt(token);
    } catch {
      throw Errors.unauthorized('Invalid internal token');
    }
  });

  app.get('/balance/:userId', async (req, reply) => {
    const { userId } = z.object({ userId: z.string().min(1) }).parse(req.params);
    const balance = await getBalanceByUserId(userId);
    return reply.send(balance);
  });
}
