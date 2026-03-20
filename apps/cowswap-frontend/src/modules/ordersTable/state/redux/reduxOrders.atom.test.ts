import { createStore, WritableAtom } from 'jotai'

import { OrderClass, OrderKind, SigningScheme, SupportedChainId } from '@cowprotocol/cow-sdk'
import { UiOrderType } from '@cowprotocol/types'
import { walletInfoAtom } from '@cowprotocol/wallet'
import type { WalletInfo } from '@cowprotocol/wallet'

import { OrderStatus } from 'legacy/state/orders/actions'
import { getDefaultNetworkState } from 'legacy/state/orders/reducer'
import type { OrderObject, OrdersState } from 'legacy/state/orders/reducer'
import type { SerializedToken } from 'legacy/state/user/types'

// Jest hoists `jest.mock` factories, and ES modules evaluate static imports before the rest of
// this file. The mock runs while `./reduxOrders.atom` loads — before `let`/`const` bindings
// here are initialized, so assigning to them in the factory hits the temporal dead zone.
// `var` is hoisted and starts as `undefined`, so the factory can assign the atom safely.
// eslint-disable-next-line no-var -- see preceding comment (TDZ); `let`/`const` fail here
var mockReduxOrdersStateAtom: WritableAtom<OrdersState, [OrdersState], void> | undefined

jest.mock('legacy/utils/atomFromReduxSelector', () => {
  const jotai = require('jotai') as typeof import('jotai')
  const { atom } = jotai
  mockReduxOrdersStateAtom = atom<OrdersState>({})
  return {
    atomFromReduxSelector: () => mockReduxOrdersStateAtom as WritableAtom<OrdersState, [OrdersState], void>,
  }
})

// Valid checksummed addresses (areAddressesEqual / isEvmAddress reject invalid hex).
const MOCK_ACCOUNT = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const OTHER_OWNER = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
const MOCK_CHAIN = SupportedChainId.MAINNET

const baseWallet: WalletInfo = {
  chainId: MOCK_CHAIN,
  account: MOCK_ACCOUNT,
  provider: {} as WalletInfo['provider'],
  legacyConnector: {} as WalletInfo['legacyConnector'],
  connector: {} as WalletInfo['connector'],
}

jest.mock('@cowprotocol/wallet', () => {
  const jotai = require('jotai') as typeof import('jotai')
  return {
    walletInfoAtom: jotai.atom({
      chainId: 1,
      account: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      provider: {},
      legacyConnector: {},
      connector: {},
    }),
  }
})

import { reduxOrdersByOrderTypeAtom, reduxOrdersStateByChainAtom } from './reduxOrders.atom'

function getMockReduxOrdersStateAtom(): WritableAtom<OrdersState, [OrdersState], void> {
  const atom = mockReduxOrdersStateAtom
  if (!atom) {
    throw new Error('mockReduxOrdersStateAtom not set by atomFromReduxSelector mock')
  }
  return atom
}

function st(address: string): SerializedToken {
  return {
    chainId: Number(MOCK_CHAIN),
    address,
    decimals: 18,
    symbol: 'T',
    name: 'Token',
  }
}

function makeOrderObject(params: { id: string; owner: string; orderClass: OrderClass }): OrderObject {
  const sell = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
  const buy = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
  // Match pending orders from trade (`owner: account`): 0x-prefixed so `areAddressesEqual` treats both sides as EVM.
  return {
    id: params.id,
    isSafeWallet: false,
    order: {
      id: params.id,
      owner: params.owner,
      class: params.orderClass,
      status: OrderStatus.PENDING,
      creationTime: new Date().toISOString(),
      sellAmountBeforeFee: '1',
      inputToken: st(sell),
      outputToken: st(buy),
      sellToken: sell.replace(/^0x/, ''),
      buyToken: buy.replace(/^0x/, ''),
      sellAmount: '1',
      buyAmount: '1',
      validTo: Math.floor(Date.now() / 1000) + 3600,
      appData: '',
      feeAmount: '0',
      kind: OrderKind.SELL,
      partiallyFillable: false,
      signature: `0x${'0'.repeat(130)}`,
      signingScheme: SigningScheme.EIP712,
      receiver: params.owner.replace(/^0x/i, ''),
    },
  }
}

describe('reduxOrdersStateByChainAtom', () => {
  let store: ReturnType<typeof createStore>

  beforeEach(() => {
    store = createStore()
    store.set(getMockReduxOrdersStateAtom(), {})
  })

  it('returns default network state merged with persisted chain state', () => {
    const pendingOrder = makeOrderObject({
      id: '0x01',
      owner: MOCK_ACCOUNT,
      orderClass: OrderClass.LIMIT,
    })

    store.set(getMockReduxOrdersStateAtom(), {
      [MOCK_CHAIN]: {
        ...getDefaultNetworkState(MOCK_CHAIN),
        pending: { '0x01': pendingOrder },
      },
    })

    const getByChain = store.get(reduxOrdersStateByChainAtom)
    const network = getByChain(MOCK_CHAIN)

    expect(network.pending['0x01']).toEqual(pendingOrder)
    expect(network.lastCheckedBlock).toBe(getDefaultNetworkState(MOCK_CHAIN).lastCheckedBlock)
  })

  it('returns empty object when chainId is falsy', () => {
    const getByChain = store.get(reduxOrdersStateByChainAtom)
    const network = getByChain(0 as SupportedChainId)
    expect(network).toEqual({})
  })
})

describe('reduxOrdersByOrderTypeAtom', () => {
  let store: ReturnType<typeof createStore>

  beforeEach(() => {
    store = createStore()
    store.set(getMockReduxOrdersStateAtom(), {})
    store.set(walletInfoAtom, baseWallet)
  })

  it('returns null triple when chainId or account is missing', () => {
    store.set(walletInfoAtom, { ...baseWallet, chainId: undefined } as unknown as WalletInfo)

    const result = store.get(reduxOrdersByOrderTypeAtom)(UiOrderType.LIMIT)
    expect(result).toEqual({
      reduxOrdersStateInCurrentChain: null,
      reduxOrders: null,
      ordersTokensSet: null,
    })

    store.set(walletInfoAtom, { ...baseWallet, account: undefined })
    const result2 = store.get(reduxOrdersByOrderTypeAtom)(UiOrderType.LIMIT)
    expect(result2.reduxOrders).toBeNull()
  })

  it('keeps only orders whose owner matches the connected account', () => {
    const mine = makeOrderObject({
      id: '0xm',
      owner: MOCK_ACCOUNT,
      orderClass: OrderClass.LIMIT,
    })
    const theirs = makeOrderObject({
      id: '0xt',
      owner: OTHER_OWNER,
      orderClass: OrderClass.LIMIT,
    })

    store.set(getMockReduxOrdersStateAtom(), {
      [MOCK_CHAIN]: {
        ...getDefaultNetworkState(MOCK_CHAIN),
        pending: { '0xm': mine, '0xt': theirs },
      },
    })

    const { reduxOrders } = store.get(reduxOrdersByOrderTypeAtom)(UiOrderType.LIMIT)

    expect(reduxOrders?.map((o) => o.id)).toEqual([mine.id])
  })

  it('keeps only orders whose UiOrderType matches the requested type', () => {
    const limitOrder = makeOrderObject({
      id: '0xl',
      owner: MOCK_ACCOUNT,
      orderClass: OrderClass.LIMIT,
    })
    const marketOrder = makeOrderObject({
      id: '0xs',
      owner: MOCK_ACCOUNT,
      orderClass: OrderClass.MARKET,
    })

    store.set(getMockReduxOrdersStateAtom(), {
      [MOCK_CHAIN]: {
        ...getDefaultNetworkState(MOCK_CHAIN),
        pending: { '0xl': limitOrder, '0xs': marketOrder },
      },
    })

    const limitResult = store.get(reduxOrdersByOrderTypeAtom)(UiOrderType.LIMIT)
    expect(limitResult.reduxOrders?.map((o) => o.id)).toEqual([limitOrder.id])

    const swapResult = store.get(reduxOrdersByOrderTypeAtom)(UiOrderType.SWAP)
    expect(swapResult.reduxOrders?.map((o) => o.id)).toEqual([marketOrder.id])
  })
})
