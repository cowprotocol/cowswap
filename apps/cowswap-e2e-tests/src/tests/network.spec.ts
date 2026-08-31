import type { Hex } from 'viem'

import { test, expect } from '../fixtures'
import { CHAIN_IDS } from '../support/constants'

test.use({ mockWalletKey: process.env.INTEGRATION_TEST_PRIVATE_KEY as Hex | undefined })

test.describe('Network', () => {
  test('[NW-01] Switching network via the UI selector resets to the default pair for that chain @smoke', async ({
    swapPage,
    header,
  }) => {
    await swapPage.goto({ chainId: CHAIN_IDS.SEPOLIA })
    await expect(swapPage.sellTokenSelect).toHaveAttribute('aria-label', 'Selected token: WETH')
    await expect(swapPage.buyTokenSelect).toHaveAttribute('aria-label', 'Selected token: USDC')

    await header.switchNetwork('Gnosis')

    await expect(swapPage.page).toHaveURL(/\/#\/100\/swap/)
    await expect(swapPage.sellTokenSelect).toHaveAttribute('aria-label', 'Selected token: WXDAI')
    await expect(swapPage.buyTokenSelect).toHaveAttribute('aria-label', 'Selected token: USDC')
  })

  test('[NW-02] Network selector meets the visible mobile and tablet header controls', async ({ swapPage, header }) => {
    for (const viewport of [
      { width: 390, height: 844 },
      { width: 960, height: 800 },
    ]) {
      await swapPage.page.setViewportSize(viewport)
      await swapPage.goto({ chainId: CHAIN_IDS.SEPOLIA })
      await header.openNetworkSelector()

      const dialogBox = await header.networkDialog.boundingBox()
      const controlsBox = await header.networkAndAccountControls.boundingBox()

      if (!dialogBox || !controlsBox) {
        throw new Error('Expected the network selector and mobile header controls to be measurable')
      }

      const layout = {
        selectorTop: Math.round(dialogBox.y),
        selectorRightGap: Math.round(viewport.width - dialogBox.x - dialogBox.width),
        selectorBottomToControls: Math.round(controlsBox.y - dialogBox.y - dialogBox.height),
        selectorLeft: Math.round(dialogBox.x),
        controlsHeight: Math.round(controlsBox.height),
        controlsBottomGap: Math.round(viewport.height - controlsBox.y - controlsBox.height),
      }

      expect(layout).toEqual({
        selectorTop: 0,
        selectorRightGap: 0,
        selectorBottomToControls: 0,
        selectorLeft: 0,
        controlsHeight: 56,
        controlsBottomGap: 0,
      })
      await expect(swapPage.page.locator('body')).toHaveClass(/noScroll/)
      await expect(swapPage.page.locator('body')).toHaveCSS('overflow', 'hidden')
      await expect(swapPage.page.locator('html')).not.toHaveCSS('overflow-y', /^(hidden|clip)$/)

      await header.closeNetworkSelector()
      await expect(swapPage.page.locator('body')).not.toHaveClass(/noScroll/)
    }
  })
})
