import { expect, test } from '@playwright/test'

import { expect as appExpect, test as appTest } from '../fixtures/mockWallet'
import { E2E_WALLET_INFO, injectedShim, type InjectedShimConfig } from '../mockWallet/injectedShim'
import { CHAIN_IDS } from '../support/constants'

const SHIM_CFG: InjectedShimConfig = {
  ...E2E_WALLET_INFO,
  address: '0x0000000000000000000000000000000000000001',
  chainIdHex: '0xaa36a7',
}

test.describe('injected shim (no app)', () => {
  test('announces via EIP-6963 and forwards request() through the binding', async ({ context, page }) => {
    await context.exposeBinding('__e2eWalletRequest', async (_source, req: unknown) => ({ ok: true, result: req }))
    await context.addInitScript(injectedShim, SHIM_CFG)
    await page.goto('about:blank')

    const rdns = await page.evaluate(
      () =>
        new Promise((resolve) => {
          window.addEventListener('eip6963:announceProvider', (e) => resolve((e as CustomEvent).detail.info.rdns), {
            once: true,
          })
          window.dispatchEvent(new Event('eip6963:requestProvider'))
        }),
    )
    expect(rdns).toBe('fi.cow.e2e-wallet')

    const echoed = await page.evaluate(() =>
      (window as never as { ethereum: { request(r: unknown): Promise<unknown> } }).ethereum.request({
        method: 'eth_chainId',
        params: [],
      }),
    )
    expect(echoed).toEqual({ method: 'eth_chainId', params: [] })
  })

  test('error envelopes reject with EIP-1193-shaped errors', async ({ context, page }) => {
    await context.exposeBinding('__e2eWalletRequest', async () => ({
      ok: false,
      error: { code: 4001, message: 'User rejected the request.' },
    }))
    await context.addInitScript(injectedShim, SHIM_CFG)
    await page.goto('about:blank')

    const caught = await page.evaluate(() =>
      (window as never as { ethereum: { request(r: unknown): Promise<unknown> } }).ethereum
        .request({ method: 'personal_sign' })
        .then(
          () => null,
          (e: { code: number; message: string }) => ({ code: e.code, message: e.message }),
        ),
    )
    expect(caught).toEqual({ code: 4001, message: 'User rejected the request.' })
  })

  test('__e2eWalletEmit dispatches provider events and updates chainId', async ({ context, page }) => {
    await context.exposeBinding('__e2eWalletRequest', async () => ({ ok: true, result: null }))
    await context.addInitScript(injectedShim, SHIM_CFG)
    await page.goto('about:blank')

    const observed = await page.evaluate(() => {
      const w = window as never as {
        ethereum: { chainId: string; on(e: string, cb: (p: unknown) => void): void }
        __e2eWalletEmit(event: string, payload: unknown): void
      }
      return new Promise((resolve) => {
        w.ethereum.on('chainChanged', (payload) => resolve({ payload, chainId: w.ethereum.chainId }))
        w.__e2eWalletEmit('chainChanged', '0x1')
      })
    })
    expect(observed).toEqual({ payload: '0x1', chainId: '0x1' })
  })
})

interface EthereumWindow {
  ethereum: {
    chainId: string
    request(args: { method: string; params?: unknown[] }): Promise<unknown>
  }
}

appTest.describe('mock wallet (app)', () => {
  appTest('boots already connected as the key address', async ({ wallet, page }) => {
    await wallet.openApp({ chainId: CHAIN_IDS.SEPOLIA })
    // Status button renders a shortened address like 0x1234...abcd — assert on the prefix.
    await appExpect(page.locator('#web3-status-connected')).toContainText(new RegExp(wallet.address.slice(0, 6), 'i'))
  })

  appTest('wallet_getCapabilities can be stubbed per test and calls are recorded', async ({ wallet }) => {
    wallet.stubRpc('wallet_getCapabilities', () => ({
      [`0x${CHAIN_IDS.SEPOLIA.toString(16)}`]: { atomic: { status: 'supported' } },
    }))
    await wallet.openApp({ chainId: CHAIN_IDS.SEPOLIA })
    // The app fetches EIP-5792 capabilities for the connected account on load.
    await appExpect.poll(() => wallet.rpcCalls('wallet_getCapabilities').length, { timeout: 15_000 }).toBeGreaterThan(0)
    const [call] = wallet.rpcCalls('wallet_getCapabilities')
    appExpect(String(call.params[0]).toLowerCase()).toBe(wallet.address.toLowerCase())
    appExpect(call.result).toEqual({ [`0x${CHAIN_IDS.SEPOLIA.toString(16)}`]: { atomic: { status: 'supported' } } })
  })

  appTest('a 4001 stub surfaces as an EIP-1193 rejection through the shim', async ({ wallet, page }) => {
    wallet.stubRpc('personal_sign', () => {
      throw { code: 4001, message: 'User rejected the request.' }
    })
    await wallet.openApp({ chainId: CHAIN_IDS.SEPOLIA })
    const rejection = await page.evaluate(
      ([addr]) =>
        (window as unknown as EthereumWindow).ethereum
          .request({ method: 'personal_sign', params: ['0x68656c6c6f', addr] })
          .then(
            () => null,
            (e: { code: number; message: string }) => ({ code: e.code, message: e.message }),
          ),
      [wallet.address] as const,
    )
    appExpect(rejection).toEqual({ code: 4001, message: 'User rejected the request.' })
    wallet.restoreRpc('personal_sign')
  })

  appTest('switchChain propagates chainChanged into the page', async ({ wallet, page }) => {
    await wallet.openApp({ chainId: CHAIN_IDS.SEPOLIA })
    await appExpect
      .poll(() => page.evaluate(() => (window as unknown as EthereumWindow).ethereum.chainId))
      .toBe(`0x${CHAIN_IDS.SEPOLIA.toString(16)}`)
    await wallet.switchChain(CHAIN_IDS.MAINNET)
    await appExpect
      .poll(() => page.evaluate(() => (window as unknown as EthereumWindow).ethereum.chainId), { timeout: 15_000 })
      .toBe('0x1')
    // Wallet stays connected across the chain change.
    await appExpect(page.locator('#web3-status-connected')).toBeVisible()
  })
})
