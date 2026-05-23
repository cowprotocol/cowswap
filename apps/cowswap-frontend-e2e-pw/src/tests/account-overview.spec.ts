import { test, expect } from '../fixtures'

test.describe('Account Pages', () => {
  test('[AC-01] Account page accessible without wallet — limited state shown @smoke', async ({ accountPage }) => {
    await accountPage.goto('overview')
    await expect(accountPage.page).toHaveURL(/\/#\/account$/)
  })
})
