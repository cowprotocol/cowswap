import { interceptEIP6963Providers } from './providerIsolation'

import type { EIP1193EventMap, EIP1193Provider } from 'viem'

type CowIsolationWindow = Window & {
  __cowEip6963InterceptRegistered?: boolean
  __cowEip6963ReDispatched?: WeakSet<Event>
}

function buildProvider(): EIP1193Provider {
  const listeners = new Map<keyof EIP1193EventMap, EIP1193EventMap[keyof EIP1193EventMap]>()

  return {
    request: jest.fn(async () => ['0x0000000000000000000000000000000000000000']) as EIP1193Provider['request'],
    on: jest.fn(<event extends keyof EIP1193EventMap>(event: event, listener: EIP1193EventMap[event]) => {
      listeners.set(event, listener)
    }) as EIP1193Provider['on'],
    removeListener: jest.fn(<event extends keyof EIP1193EventMap>(event: event) => {
      listeners.delete(event)
    }) as EIP1193Provider['removeListener'],
  }
}

describe('interceptEIP6963Providers', () => {
  it('re-dispatches announced providers with frozen EIP-6963 detail', () => {
    const win = window as CowIsolationWindow
    delete win.__cowEip6963InterceptRegistered
    delete win.__cowEip6963ReDispatched

    const originalProvider = buildProvider()
    const receivedDetails: Array<{ info: { name: string; rdns: string }; provider: EIP1193Provider }> = []

    interceptEIP6963Providers()

    window.addEventListener('eip6963:announceProvider', (event) => {
      receivedDetails.push(
        (event as CustomEvent<{ info: { name: string; rdns: string }; provider: EIP1193Provider }>).detail,
      )
    })

    window.dispatchEvent(
      new CustomEvent('eip6963:announceProvider', {
        detail: Object.freeze({
          info: { name: 'MetaMask', rdns: 'io.metamask' },
          provider: originalProvider,
        }),
      }),
    )

    expect(receivedDetails).toHaveLength(1)
    expect(Object.isFrozen(receivedDetails[0])).toBe(true)
    expect(receivedDetails[0].provider).not.toBe(originalProvider)
  })
})
