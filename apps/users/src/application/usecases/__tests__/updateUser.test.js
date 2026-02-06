import { describe, test, expect, jest } from '@jest/globals';
import { updateUserUseCase } from '../updateUser.js';

function makeRepo() {
  return {
    update: jest.fn(async () => null),
  };
}

describe('updateUserUseCase', () => {
  test('success: updates and returns updated user', async () => {
    const repo = makeRepo();
    repo.update.mockResolvedValueOnce({
      id: 'u-1',
      first_name: 'Raoni Updated',
      last_name: 'Dev',
      email: 'raoni@example.com',
    });

    const execute = updateUserUseCase(repo);

    const result = await execute({ id: 'u-1' }, { first_name: 'Raoni Updated' });

    expect(repo.update).toHaveBeenCalledTimes(1);
    expect(repo.update.mock.calls[0][0]).toBe('u-1');

    const patch = repo.update.mock.calls[0][1];
    expect(patch).toMatchObject({ first_name: 'Raoni Updated' });

    expect(result).toHaveProperty('first_name', 'Raoni Updated');
  });

  test('error: empty patch -> throws', async () => {
    const repo = makeRepo();
    const execute = updateUserUseCase(repo);

    await expect(execute({ id: 'u-1' }, {})).rejects.toBeTruthy();
  });

  test('error: not found -> notFound', async () => {
    const repo = makeRepo();
    const execute = updateUserUseCase(repo);

    await expect(
      execute({ id: 'missing' }, { first_name: 'X' })
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});
