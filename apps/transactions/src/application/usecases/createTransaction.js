import { z } from 'zod';
import { Errors } from '@ilia/shared';
import { randomUUID } from 'node:crypto';

const schema = z.object({
  user_id: z.string().min(1),
  type: z.enum(['CREDIT', 'DEBIT']),
  amount: z.number().int().positive(),
});

export function createTransactionUseCase(repo) {
  return async function execute(input, authUserId) {
    const parsed = schema.safeParse(input);
    if (!parsed.success) {
      throw Errors.badRequest('Invalid request body');
    }

    const data = parsed.data;

    if (data.user_id !== authUserId) {
      throw Errors.forbidden('user_id does not match authenticated user');
    }

    const id = randomUUID();

    const created = await repo.insertTransaction({
      id,
      user_id: data.user_id,
      type: data.type,
      amount: data.amount,
    });

    return created;
  };
}
