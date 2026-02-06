import { describe, test, expect, jest } from '@jest/globals';
import { deleteUserUseCase } from '../deleteUser.js';

function makeRepo() {
  return {
    delete: jest.fn(async () => true),
  };
}

function makeTransactionsClient() {
  return {
    getBalanceByUserId: jest.fn(async () => ({ amount: 0 })),
  };
}

describe('deleteUserUseCase', () => {
  test('success: deletes user when wallet balance is zero', async () => {
    const repo = makeRepo();
    const transactionsClient = makeTransactionsClient();

    const execute = deleteUserUseCase({ usersRepository: repo, transactionsClient });

    const result = await execute({ id: 'u-1' });

    expect(transactionsClient.getBalanceByUserId).toHaveBeenCalledWith('u-1');
    expect(repo.delete).toHaveBeenCalledWith('u-1');
    expect(result).toEqual({ ok: true });
  });

  test('error: blocks delete when wallet balance is not zero (409)', async () => {
    const repo = makeRepo();
    const transactionsClient = makeTransactionsClient();
    transactionsClient.getBalanceByUserId.mockResolvedValueOnce({ amount: 10 });

    const execute = deleteUserUseCase({ usersRepository: repo, transactionsClient });

    await expect(execute({ id: 'u-1' })).rejects.toMatchObject({ statusCode: 409 });
    expect(repo.delete).not.toHaveBeenCalled();
  });

  test('error: invalid params -> throws', async () => {
    const repo = makeRepo();
    const transactionsClient = makeTransactionsClient();

    const execute = deleteUserUseCase({ usersRepository: repo, transactionsClient });

    await expect(execute({ id: '' })).rejects.toBeTruthy();
  });
});
