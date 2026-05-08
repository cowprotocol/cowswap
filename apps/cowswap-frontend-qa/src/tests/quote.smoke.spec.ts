import { expect, test } from '../fixtures'
import { swapSelectors } from '../helpers/selectors'
import { buildMainnetSwapRoute, MAINNET_USDC, MAINNET_WETH } from '../helpers/tokens'
import { connectInjectedWallet, expectSellAmount } from '../helpers/trade'
import { waitForNonZeroInputValue } from '../helpers/wait'

test('quote smoke: mainnet WETH -> USDC renders a non-zero buy amount', async ({ page }) => {
  await page.goto(buildMainnetSwapRoute(MAINNET_WETH, MAINNET_USDC, { orderKind: 'sell', sellAmount: '1' }))

  await connectInjectedWallet(page)
  await expectSellAmount(page, '1')

  const buyAmount = await waitForNonZeroInputValue(page.locator(swapSelectors.buyAmountInput))

  expect(buyAmount).toBeGreaterThan(0)
})
