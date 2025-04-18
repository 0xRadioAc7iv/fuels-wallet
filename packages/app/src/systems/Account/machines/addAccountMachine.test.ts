import { interpret } from 'xstate';
import { expectStateMatch, mockVault } from '~/systems/Core/__tests__/utils';

import { AccountService } from '../services';

import { mockServer } from '~/systems/Core/__tests__/utils/msw';
import type { AddAccountMachineService } from './addAccountMachine';
import { addAccountMachine } from './addAccountMachine';

const machine = addAccountMachine.withContext({}).withConfig({
  actions: {
    notifyUpdateAccounts() {},
  },
});

describe('addAccountMachine', () => {
  let service: AddAccountMachineService;
  const server = mockServer();
  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
    service?.stop();
  });
  afterAll(() => server.close());

  beforeEach(async () => {
    await mockVault();
    service = interpret(machine).start();
  });

  describe('add', () => {
    it('should be able to add an account', async () => {
      await expectStateMatch(service, 'idle');
      service.send('ADD_ACCOUNT');

      await expectStateMatch(service, 'addingAccount');
      await expectStateMatch(service, 'idle');

      const accounts = await AccountService.getAccounts();
      expect(accounts?.[1].name).toBe('Account 2');
    });
  });
});
