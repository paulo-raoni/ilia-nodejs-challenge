import { describe, test, expect, jest } from '@jest/globals';
import { deleteUserUseCase } from '../deleteUser.js';

function makeRepo() {
  return {
    delete: jest.fn(async () => true),
  };
}

describe('deleteUserUseCase', () => {
  test('success: deletes and returns ok', async () => {
    const repo = makeRepo();
    const execute = deleteUserUseCase(repo);

    const result = await execute({ id: 'u-1' });

    expect(repo.delete).toHaveBeenCalledWith('u-1');
    expect(result).toEqual({ ok: true });
  });

  test('error: invalid params -> throws', async () => {
    const repo = makeRepo();
    const execute = deleteUserUseCase(repo);

    await expect(execute({ id: '' })).rejects.toBeTruthy();
  });
});
