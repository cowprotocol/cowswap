import { expect } from '../fixtures'

import type { AccountModal } from '../pages/AccountModal'

/** Opens the account drawer, asserts the activities list shows `status`, then closes it again. */
export async function expectActivityStatus(
  accountModal: AccountModal,
  status: string,
  opts?: { timeout?: number },
): Promise<void> {
  await accountModal.open()
  await accountModal.activitiesList.scrollIntoViewIfNeeded()
  await expect(accountModal.activitiesList).toContainText(status, opts)
  await accountModal.close()
}
