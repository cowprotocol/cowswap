import { expect, test } from '@playwright/test'

import { E2E_WALLET_INFO, injectedShim, type InjectedShimConfig } from '../mockWallet/injectedShim'

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
