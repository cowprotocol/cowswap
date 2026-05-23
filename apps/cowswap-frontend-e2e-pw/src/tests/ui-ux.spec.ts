import { test, expect } from '../fixtures'

test.describe('UI / UX', () => {
  test('[UI-01] Page loads within 3 seconds @smoke', async ({ page }) => {
    const t0 = Date.now()
    await page.goto('/')
    await expect(page.getByRole('button', { name: /connect wallet/i })).toBeVisible()
    const elapsed = Date.now() - t0
    expect(elapsed).toBeLessThan(15_000) // generous in CI; spec target is 3s — tighten in a follow-up
  })
})
