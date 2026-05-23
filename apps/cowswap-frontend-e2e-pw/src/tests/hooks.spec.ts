import { test, expect } from '../fixtures'
import { CHAIN_IDS } from '../support/constants'

test.describe('Hooks', () => {
  test('[HK-01] Enable Hooks via settings toggle @smoke', async ({ swapPage, wallet, page }) => {
    await wallet.connectAsEOA({ chainId: CHAIN_IDS.SEPOLIA })
    await swapPage.goto({ chainId: CHAIN_IDS.SEPOLIA })
    await page.getByRole('button', { name: /settings/i }).click()
    await page.getByRole('checkbox', { name: /hooks/i }).check()
    await expect(page.getByText(/hooks/i)).toBeVisible()
  })
  test(
    '[HK-02] Hooks not available on ETH-flow',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[HK-03] Add a Pre-hook to a swap order',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[HK-04] Add a Post-hook to a swap order',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[HK-05] Remove a hook before placing order',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[HK-06] Hooks section shows correct gas estimate impact',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[HK-07] Disable Hooks — section disappears from form',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
})
