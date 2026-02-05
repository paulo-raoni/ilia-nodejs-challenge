import { z } from 'zod';

const paramsSchema = z.object({ id: z.string().min(1) });

export function deleteUserUseCase(repo) {
  return async (params) => {
    const { id } = paramsSchema.parse(params);
    await repo.delete(id);
    return { ok: true };
  };
}
