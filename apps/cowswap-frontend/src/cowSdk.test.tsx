import { Provider, createStore } from 'jotai'

import { usePublicClient, useWalletClient } from 'wagmi'

import { OrderQuoteRequest, SupportedChainId } from '@cowprotocol/cow-sdk'

import { render } from '@testing-library/react'

import { CowSdkUpdater, appSignerAccountAtom, appSignerAtom, orderBookApi } from './cowSdk'

jest.mock('wagmi', () => ({ usePublicClient: jest.fn(), useWalletClient: jest.fn() }))
jest.mock('@cowprotocol/sdk-viem-adapter', () => ({
  ViemAdapter: jest.fn().mockImplementation(() => ({ signer: 'viem-signer' })),
}))

const mockUsePublicClient = jest.mocked(usePublicClient)
const mockUseWalletClient = jest.mocked(useWalletClient)

const ACCOUNT = '0x1111111111111111111111111111111111111111'

function renderUpdater(store: ReturnType<typeof createStore>): void {
  render(
    <Provider store={store}>
      <CowSdkUpdater />
    </Provider>,
  )
}

function setWalletClient(walletClient: unknown): void {
  mockUseWalletClient.mockReturnValue({ data: walletClient } as ReturnType<typeof useWalletClient>)
}

beforeEach(() => {
  jest.clearAllMocks()
  mockUsePublicClient.mockReturnValue({} as ReturnType<typeof usePublicClient>)
})

const quoteRequest = {} as OrderQuoteRequest

function rejectedQuoteResponse(): Response {
  return {
    ok: false,
    status: 400,
    statusText: 'Bad Request',
    headers: { get: () => 'application/json' },
    json: async () => ({ errorType: 'NoLiquidity', description: 'no' }),
    text: async () => '',
  } as unknown as Response
}

describe('orderBookApi.getQuote', () => {
  const previousChainId = orderBookApi.context.chainId
  const previousEnv = orderBookApi.context.env

  beforeEach(() => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(rejectedQuoteResponse())
  })

  afterEach(() => {
    orderBookApi.context.chainId = previousChainId
    orderBookApi.context.env = previousEnv
    jest.restoreAllMocks()
  })

  it('keeps a non-Linea quote on the env-resolved orderbook', async () => {
    orderBookApi.context.chainId = SupportedChainId.MAINNET
    orderBookApi.context.env = 'prod'

    await orderBookApi.getQuote(quoteRequest).catch((err: unknown) => err)

    expect(String(jest.mocked(globalThis.fetch).mock.calls[0]?.[0])).toBe('https://api.cow.fi/mainnet/api/v1/quote')
  })

  it('sends a Linea quote to barn', async () => {
    orderBookApi.context.chainId = SupportedChainId.LINEA
    orderBookApi.context.env = 'prod'

    await orderBookApi.getQuote(quoteRequest).catch((err: unknown) => err)

    expect(String(jest.mocked(globalThis.fetch).mock.calls[0]?.[0])).toBe('https://barn.api.cow.fi/linea/api/v1/quote')
  })
})

describe('CowSdkUpdater', () => {
  it('publishes the signer and its account once a wallet with an EVM account connects', () => {
    const store = createStore()
    setWalletClient({ account: { address: ACCOUNT } })

    renderUpdater(store)

    expect(store.get(appSignerAtom)).toBe('viem-signer')
    expect(store.get(appSignerAccountAtom)).toBe(ACCOUNT)
  })

  /*
   * A WalletConnect session approved for Solana only leaves wagmi connected with no eip155 account.
   * `useWalletInfo().chainId` follows the selected network, not the connected namespace, so an EVM
   * chain stays selectable and `useAppSigner` consumers (order cancellation) would otherwise sign
   * with the account from the previous connection.
   */
  it('clears the previous signer when the connection loses its EVM account', () => {
    const store = createStore()
    store.set(appSignerAtom, 'stale-signer' as never)
    store.set(appSignerAccountAtom, ACCOUNT)
    setWalletClient({ account: undefined })

    renderUpdater(store)

    expect(store.get(appSignerAtom)).toBeUndefined()
    expect(store.get(appSignerAccountAtom)).toBeUndefined()
  })

  // Distinct from an accountless connection: wagmi reports no wallet client while it is still
  // restoring, and dropping the signer there would break signing across a reconnect.
  it('keeps the signer while there is no wallet client at all', () => {
    const store = createStore()
    store.set(appSignerAtom, 'previous-signer' as never)
    store.set(appSignerAccountAtom, ACCOUNT)
    setWalletClient(undefined)

    renderUpdater(store)

    expect(store.get(appSignerAtom)).toBe('previous-signer')
    expect(store.get(appSignerAccountAtom)).toBe(ACCOUNT)
  })
})
