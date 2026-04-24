import { expect, type Page } from '@playwright/test'

import { accountSelectors, ethFlowSelectors, swapSelectors, walletSelectors } from './selectors'

const CONNECT_INJECTED_WALLET_EVENT = 'cowswap-connect-injected-wallet'
const FORCE_ONCHAIN_APPROVAL_SESSION_KEY = 'cowswap:qaForceOnchainApproval:v0'

export async function forceOnchainApproval(page: Page): Promise<void> {
  await page.addInitScript((sessionKey) => {
    window.sessionStorage.setItem(sessionKey, 'true')
  }, FORCE_ONCHAIN_APPROVAL_SESSION_KEY)
}

export async function connectInjectedWallet(page: Page): Promise<void> {
  const connectedWalletStatus = page.locator(walletSelectors.connectedWalletStatus)

  if (await connectedWalletStatus.isVisible()) {
    return
  }

  await expect(page.locator(walletSelectors.connectWalletButton)).toBeVisible()
  await page.evaluate((eventName) => {
    document.dispatchEvent(new CustomEvent(eventName))
  }, CONNECT_INJECTED_WALLET_EVENT)

  await expect(connectedWalletStatus).toBeVisible()
}

export async function unlockCrossChainSwapIfPresent(page: Page): Promise<void> {
  const unlockCrossChainSwapButton = page.locator(swapSelectors.unlockCrossChainSwapButton)

  if (await unlockCrossChainSwapButton.isVisible()) {
    await unlockCrossChainSwapButton.click()
  }
}

export async function expectSellAmount(page: Page, amount: string): Promise<void> {
  await unlockCrossChainSwapIfPresent(page)

  const sellAmountInput = page.locator(swapSelectors.sellAmountInput)
  await expect(sellAmountInput).toBeVisible()
  await expect(sellAmountInput).toHaveValue(amount)
}

export async function openNativeWrapModal(page: Page): Promise<void> {
  await unlockCrossChainSwapIfPresent(page)

  const wrapNativeButton = page.locator(ethFlowSelectors.wrapNativeButton)
  if (await wrapNativeButton.isVisible()) {
    await wrapNativeButton.click()
    return
  }

  const ethFlowBanner = page.locator(ethFlowSelectors.banner)
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await ethFlowBanner.waitFor({ state: 'visible', timeout: 5_000 })
      await ethFlowBanner.click()
      await wrapNativeButton.waitFor({ state: 'visible', timeout: 5_000 })
      await wrapNativeButton.click()
      return
    } catch {
      // The banner may render shortly after the quote; retry before failing the native-flow path.
    }
  }

  await expect(wrapNativeButton).toBeVisible()
}

export async function openAccountModal(page: Page): Promise<void> {
  await page.locator(walletSelectors.connectedWalletStatus).click()
  await expect(page.locator(accountSelectors.accountIdentifierRow)).toBeVisible()
  await expect(page.getByText('Your total surplus')).toBeVisible()
}
