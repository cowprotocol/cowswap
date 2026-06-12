import { createStore, type WritableAtom } from 'jotai'

import { getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'
import type { TokensByAddress } from '@cowprotocol/tokens'

import { waitFor } from '@testing-library/react'

// eslint-disable-next-line import/no-internal-modules -- fixtures need TwapOrderItem; avoid entities/twap barrel
import { TwapOrderStatus, type TwapOrderItem } from 'modules/twap/types'

import { fetchTokens } from 'common/state/fetchTokens.utils'

jest.mock('modules/orders', () => ({
  getTokensListFromOrders: jest.requireActual('modules/orders/utils/getTokensListFromOrders').getTokensListFromOrders,
}))

import {
  twapOrdersTokensAddressesAtom,
  twapOrdersTokensAsyncAtom,
  twapOrdersTokensAtom,
  twapOrdersTokensLoadableAtom,
} from './twapOrdersTokensAtom'

// eslint-disable-next-line no-var -- Jest mock factory runs before `let`/`const` init (TDZ); see reduxOrders.atom.test.ts
var mockTwapOrdersListAtom: WritableAtom<TwapOrderItem[], [TwapOrderItem[]], void> | undefined

jest.mock('./twapOrdersListAtom', () => {
  const jotai = require('jotai') as typeof import('jotai')
  mockTwapOrdersListAtom = jotai.atom<TwapOrderItem[]>([])
  return { twapOrdersListAtom: mockTwapOrdersListAtom }
})

// eslint-disable-next-line no-var -- see mock comment above
var mockTokensPayload: { tokens: TokensByAddress; chainId: SupportedChainId } | undefined

jest.mock('@cowprotocol/tokens', () => {
  const jotai = require('jotai') as typeof import('jotai')
  const { SupportedChainId: SC } = require('@cowprotocol/cow-sdk') as typeof import('@cowprotocol/cow-sdk')
  const payload = { tokens: {}, chainId: SC.MAINNET }
  mockTokensPayload = payload
  const tokensByAddressAtom = jotai.atom(async () => ({
    tokens: payload.tokens,
    chainId: payload.chainId,
  }))
  return { tokensByAddressAtom }
})

jest.mock('common/state/fetchTokens.utils', () => ({
  fetchTokens: jest.fn(),
}))

const mockFetchTokens = jest.mocked(fetchTokens)

const SELL = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
const BUY = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'

function makeTwapOrderItem(sellToken: string, buyToken: string): TwapOrderItem {
  return {
    id: 'twap-1',
    chainId: SupportedChainId.MAINNET,
    safeAddress: '0x0000000000000000000000000000000000000001',
    status: TwapOrderStatus.Pending,
    submissionDate: '2024-01-01T00:00:00.000Z',
    executionInfo: {
      info: { executedSellAmount: '0', executedBuyAmount: '0', executedFeeAmount: '0' },
      confirmedPartsCount: 0,
    },
    order: {
      sellToken,
      buyToken,
      receiver: '0x',
      partSellAmount: '1',
      minPartLimit: '1',
      t0: 0,
      n: 1,
      t: 1,
      span: 1,
      appData: '',
    },
  }
}

function getListAtom(): WritableAtom<TwapOrderItem[], [TwapOrderItem[]], void> {
  const a = mockTwapOrdersListAtom
  if (!a) {
    throw new Error('mockTwapOrdersListAtom not initialized')
  }
  return a
}

function getTokensPayload(): { tokens: TokensByAddress; chainId: SupportedChainId } {
  const p = mockTokensPayload
  if (!p) {
    throw new Error('mockTokensPayload not initialized')
  }
  return p
}

describe('twapOrdersTokensAtom', () => {
  let store: ReturnType<typeof createStore>

  beforeEach(() => {
    store = createStore()
    mockFetchTokens.mockReset()
    const payload = getTokensPayload()
    payload.tokens = {}
    payload.chainId = SupportedChainId.MAINNET
    store.set(getListAtom(), [])
  })

  it('twapOrdersTokensAddressesAtom derives unique sell/buy addresses from orders', () => {
    store.set(getListAtom(), [makeTwapOrderItem(SELL, BUY)])

    expect(store.get(twapOrdersTokensAddressesAtom)).toEqual(expect.arrayContaining([SELL, BUY]))
    expect(store.get(twapOrdersTokensAddressesAtom)).toHaveLength(2)
  })

  it('initial loadable state is loading then twapOrdersTokensAtom is null until data resolves', async () => {
    store.set(getListAtom(), [makeTwapOrderItem(SELL, BUY)])

    let resolveFetch!: (value: TokensByAddress | null) => void
    const pending = new Promise<TokensByAddress | null>((resolve) => {
      resolveFetch = resolve
    })
    mockFetchTokens.mockReturnValueOnce(pending)

    const loading = store.get(twapOrdersTokensLoadableAtom)
    expect(loading.state).toBe('loading')
    expect(store.get(twapOrdersTokensAtom)).toBeNull()

    resolveFetch({
      [getAddressKey(SELL)]: {} as TokensByAddress[string],
      [getAddressKey(BUY)]: undefined,
    })

    await waitFor(() => {
      expect(store.get(twapOrdersTokensLoadableAtom).state).toBe('hasData')
    })
    expect(store.get(twapOrdersTokensAtom)).toEqual({
      [getAddressKey(SELL)]: {},
      [getAddressKey(BUY)]: undefined,
    })
  })

  it('successful fetch exposes data on twapOrdersTokensAtom', async () => {
    store.set(getListAtom(), [makeTwapOrderItem(SELL, BUY)])

    const result: TokensByAddress = {
      [getAddressKey(SELL)]: {} as TokensByAddress[string],
      [getAddressKey(BUY)]: {} as TokensByAddress[string],
    }
    mockFetchTokens.mockResolvedValueOnce(result)

    await expect(store.get(twapOrdersTokensAsyncAtom)).resolves.toEqual(result)

    await waitFor(() => {
      expect(store.get(twapOrdersTokensLoadableAtom)).toEqual({ state: 'hasData', data: result })
    })
    expect(store.get(twapOrdersTokensAtom)).toEqual(result)
  })

  it('fetch failure yields loadable error and twapOrdersTokensAtom stays null', async () => {
    store.set(getListAtom(), [makeTwapOrderItem(SELL, BUY)])

    const err = new Error('rpc failed')
    mockFetchTokens.mockRejectedValueOnce(err)

    await expect(store.get(twapOrdersTokensAsyncAtom)).rejects.toThrow('rpc failed')

    await waitFor(() => {
      const loadableState = store.get(twapOrdersTokensLoadableAtom)
      expect(loadableState.state).toBe('hasError')
      if (loadableState.state === 'hasError') {
        expect(loadableState.error).toBe(err)
      }
    })
    expect(store.get(twapOrdersTokensAtom)).toBeNull()
  })

  it('when fetchTokens returns a full key map with one token unresolved, loadable succeeds with undefined for that key', async () => {
    store.set(getListAtom(), [makeTwapOrderItem(SELL, BUY)])
    const full: TokensByAddress = {
      [getAddressKey(SELL)]: {} as TokensByAddress[string],
      [getAddressKey(BUY)]: undefined,
    }
    mockFetchTokens.mockResolvedValueOnce(full)

    await expect(store.get(twapOrdersTokensAsyncAtom)).resolves.toEqual(full)

    await waitFor(() => {
      expect(store.get(twapOrdersTokensLoadableAtom)).toEqual({ state: 'hasData', data: full })
    })
    expect(store.get(twapOrdersTokensAtom)).toEqual(full)
  })

  it('with no twap orders, passes empty address list to fetchTokens', async () => {
    mockFetchTokens.mockResolvedValueOnce({})

    await store.get(twapOrdersTokensAsyncAtom)

    expect(mockFetchTokens).toHaveBeenCalledTimes(1)
    expect(mockFetchTokens).toHaveBeenCalledWith(SupportedChainId.MAINNET, getTokensPayload().tokens, [])
    await waitFor(() => {
      expect(store.get(twapOrdersTokensLoadableAtom)).toEqual({ state: 'hasData', data: {} })
    })
    expect(store.get(twapOrdersTokensAtom)).toEqual({})
  })

  it('passes chainId and tokens from tokensByAddressAtom and the address list into fetchTokens', async () => {
    store.set(getListAtom(), [makeTwapOrderItem(SELL, BUY)])

    const payload = getTokensPayload()
    payload.chainId = SupportedChainId.GNOSIS_CHAIN
    payload.tokens = { [getAddressKey(SELL)]: {} as TokensByAddress[string] }

    mockFetchTokens.mockResolvedValueOnce({})

    await store.get(twapOrdersTokensAsyncAtom)

    expect(mockFetchTokens).toHaveBeenCalledTimes(1)
    expect(mockFetchTokens).toHaveBeenCalledWith(
      SupportedChainId.GNOSIS_CHAIN,
      payload.tokens,
      expect.arrayContaining([SELL, BUY]),
    )
  })
})
