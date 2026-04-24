import { expect, type Locator } from '@playwright/test'

function parseNumericValue(value: string): number {
  const normalized = value.replaceAll(',', '').trim()

  if (!normalized) {
    return 0
  }

  return Number.parseFloat(normalized)
}

export async function waitForNonZeroInputValue(locator: Locator): Promise<number> {
  await expect
    .poll(
      async () => {
        return parseNumericValue(await locator.inputValue())
      },
      { message: 'Expected quote output to become a non-zero number' },
    )
    .toBeGreaterThan(0)

  return parseNumericValue(await locator.inputValue())
}
