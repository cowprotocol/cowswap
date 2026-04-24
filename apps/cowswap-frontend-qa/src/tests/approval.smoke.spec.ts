import { parseEther } from 'viem'

import { expect, test } from '../fixtures'
import { assertWethApprovalProof, createWethApprovalProofBaseline } from '../helpers/approvalProof'
import { swapSelectors } from '../helpers/selectors'
import { buildMainnetSwapRoute, MAINNET_USDC, MAINNET_WETH } from '../helpers/tokens'
import { connectInjectedWallet, expectSellAmount, forceOnchainApproval } from '../helpers/trade'
import { waitForNonZeroInputValue } from '../helpers/wait'

test('approval smoke: mainnet WETH approval persists and unlocks swap after reload', async ({
  anvilUrl,
  page,
  walletAddress,
  wrapNativeToWeth,
}, testInfo) => {
  test.setTimeout(120_000)

  await forceOnchainApproval(page)
  await wrapNativeToWeth(parseEther('2'))
  await page.goto(buildMainnetSwapRoute(MAINNET_WETH, MAINNET_USDC, { orderKind: 'sell', sellAmount: '1' }))

  await connectInjectedWallet(page)
  await expectSellAmount(page, '1')
  await waitForNonZeroInputValue(page.locator(swapSelectors.buyAmountInput))

  const approvalProofBaseline = await createWethApprovalProofBaseline({ anvilUrl, owner: walletAddress })

  const approveTradeButton = page.locator(swapSelectors.approveTradeButton)
  await expect(approveTradeButton).toBeVisible()
  await expect(approveTradeButton).toContainText('Approve and Swap')
  await approveTradeButton.click()

  await assertWethApprovalProof({ anvilUrl, baseline: approvalProofBaseline, owner: walletAddress, testInfo })

  const tradeConfirmationButton = page.locator(swapSelectors.tradeConfirmationButton)
  await expect(tradeConfirmationButton).toBeVisible({ timeout: 30_000 })
  await expect(tradeConfirmationButton).toContainText('Confirm Swap')

  await page.reload()

  await connectInjectedWallet(page)
  await expectSellAmount(page, '1')
  await waitForNonZeroInputValue(page.locator(swapSelectors.buyAmountInput))

  const swapActionButton = page.locator(swapSelectors.swapActionButton)
  await expect(swapActionButton).toBeVisible({ timeout: 30_000 })
  await expect(swapActionButton).toContainText('Swap')
  await expect(approveTradeButton).not.toBeVisible()
})
