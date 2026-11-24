import { IframeSolanaProviderBridge } from './IframeSolanaProviderBridge'
import { SolanaProvider, SolanaProviderEvent, SolanaProviderEventHandler } from './solanaProviderTypes'
import { WidgetSolanaProvider } from './WidgetSolanaProvider'

const TRUSTED_ORIGIN = 'https://swap.cow.fi'
const ACCOUNT = 'CoWSoLaNaAcCoUnT11111111111111111111111111'

/**
 * Both ends live in the same jsdom window, so `postMessage` is re-dispatched with the origin the
 * transport trusts — otherwise every message is rejected before either side sees it.
 */
function bridgeWindowsToEachOther(): () => void {
  const original = window.postMessage.bind(window)

  window.postMessage = ((data: unknown): void => {
    window.dispatchEvent(new MessageEvent('message', { data, origin: TRUSTED_ORIGIN, source: window }))
  }) as typeof window.postMessage

  return () => {
    window.postMessage = original
  }
}

function createHostWallet(overrides: Partial<SolanaProvider> = {}): SolanaProvider {
  const handlers = new Map<SolanaProviderEvent, SolanaProviderEventHandler[]>()

  return {
    connect: jest.fn(async () => [ACCOUNT]),
    disconnect: jest.fn(async () => void 0),
    signTransactions: jest.fn(async (transactions: string[]) => transactions.map((tx) => `signed:${tx}`)),
    on(event, handler) {
      handlers.set(event, [...(handlers.get(event) || []), handler])
    },
    removeListener(event, handler) {
      handlers.set(
        event,
        (handlers.get(event) || []).filter((candidate) => candidate !== handler),
      )
    },
    // Exposed for the tests to fire host-side events.
    ...overrides,
    emit: (event: SolanaProviderEvent, accounts: string[]) =>
      (handlers.get(event) || []).forEach((handler) => handler(accounts)),
  } as SolanaProvider & { emit(event: SolanaProviderEvent, accounts: string[]): void }
}

describe('Solana iframe provider', () => {
  let restorePostMessage: () => void
  let bridge: IframeSolanaProviderBridge
  let provider: WidgetSolanaProvider

  beforeEach(() => {
    restorePostMessage = bridgeWindowsToEachOther()
    bridge = new IframeSolanaProviderBridge(window, TRUSTED_ORIGIN)
    provider = new WidgetSolanaProvider({ eventSource: window, eventTarget: window, targetOrigin: TRUSTED_ORIGIN })
  })

  afterEach(() => {
    bridge.disconnect()
    restorePostMessage()
  })

  it('connects through the host wallet', async () => {
    bridge.onConnect(createHostWallet())

    await expect(provider.connect()).resolves.toEqual([ACCOUNT])
    expect(provider.connectedAccounts).toEqual([ACCOUNT])
  })

  it('round-trips a transaction to the host wallet and back', async () => {
    const wallet = createHostWallet()
    bridge.onConnect(wallet)

    await expect(provider.signTransactions(['dHg='])).resolves.toEqual(['signed:dHg='])
    expect(wallet.signTransactions).toHaveBeenCalledWith(['dHg='])
  })

  it('rejects with the host wallet error instead of hanging', async () => {
    bridge.onConnect(
      createHostWallet({
        signTransactions: jest.fn(async () => {
          throw new Error('User rejected the request')
        }),
      }),
    )

    await expect(provider.signTransactions(['dHg='])).rejects.toThrow('User rejected the request')
  })

  it('replays requests that arrived before the host connected its wallet', async () => {
    const pending = provider.connect()

    bridge.onConnect(createHostWallet())

    await expect(pending).resolves.toEqual([ACCOUNT])
  })

  it('forwards the host wallet switching accounts', async () => {
    const wallet = createHostWallet() as SolanaProvider & {
      emit(event: SolanaProviderEvent, accounts: string[]): void
    }
    bridge.onConnect(wallet)
    await provider.connect()

    wallet.emit(SolanaProviderEvent.ACCOUNTS_CHANGED, ['OtherAccount1111111111111111111111111111111'])

    expect(provider.connectedAccounts).toEqual(['OtherAccount1111111111111111111111111111111'])
  })

  it('clears the accounts when the host wallet disconnects', async () => {
    const wallet = createHostWallet() as SolanaProvider & {
      emit(event: SolanaProviderEvent, accounts: string[]): void
    }
    bridge.onConnect(wallet)
    await provider.connect()

    wallet.emit(SolanaProviderEvent.DISCONNECT, [])

    expect(provider.connectedAccounts).toEqual([])
  })

  it('serves again through a fresh bridge after the old one was disconnected', async () => {
    bridge.onConnect(createHostWallet())
    bridge.disconnect()

    const nextWallet = createHostWallet()
    const nextBridge = new IframeSolanaProviderBridge(window, TRUSTED_ORIGIN)
    nextBridge.onConnect(nextWallet)

    await expect(provider.connect()).resolves.toEqual([ACCOUNT])
    expect(nextWallet.connect).toHaveBeenCalled()

    nextBridge.disconnect()
  })

  it('stops serving requests once the bridge is disconnected', async () => {
    bridge.onConnect(createHostWallet())
    await provider.connect()

    bridge.disconnect()

    const provider2 = new WidgetSolanaProvider({
      eventSource: window,
      eventTarget: window,
      targetOrigin: TRUSTED_ORIGIN,
      timeoutMilliseconds: 10,
    })

    await expect(provider2.signTransactions(['dHg='])).rejects.toThrow(/did not answer/)
  })
})
