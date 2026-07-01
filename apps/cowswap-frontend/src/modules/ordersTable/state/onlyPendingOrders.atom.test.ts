import { createStore } from 'jotai'

import { OrderClass, OrderKind, SigningScheme, SupportedChainId } from '@cowprotocol/cow-sdk'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { OrderStatus } from 'legacy/state/orders/actions'
import { getDefaultNetworkState } from 'legacy/state/orders/reducer'
import type { OrderObject } from 'legacy/state/orders/reducer'
import type { SerializedToken } from 'legacy/state/user/types'

jest.mock('@cowprotocol/wallet', () => {
  const { atom } = require('jotai') as typeof import('jotai')

  return {
    walletInfoAtom: atom<{ account?: string; chainId?: number }>({}),
  }
})

jest.mock('./redux/reduxOrders.atom', () => {
  const { atom } = require('jotai') as typeof import('jotai')

  return {
    reduxOrdersStateAtom: atom({}),
  }
})

import { onlyPendingOrdersAtom } from './onlyPendingOrders.atom'
import { reduxOrdersStateAtom } from './redux/reduxOrders.atom'

const MOCK_ACCOUNT = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const MOCK_CHAIN = SupportedChainId.MAINNET

function st(address: string): SerializedToken {
  return {
    chainId: Number(MOCK_CHAIN),
    address,
    decimals: 18,
    symbol: 'T',
    name: 'Token',
  }
}

function makeOrderObject(params: { id: string; orderClass: OrderClass }): OrderObject {
  const sell = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
  const buy = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'

  return {
    id: params.id,
    isSafeWallet: false,
    order: {
      id: params.id,
      owner: MOCK_ACCOUNT,
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
      receiver: MOCK_ACCOUNT.replace(/^0x/i, ''),
    },
  }
}

describe('onlyPendingOrdersAtom', () => {
  it('returns pending limit and swap orders for the connected account', () => {
    const limitOrder = makeOrderObject({ id: '0xl', orderClass: OrderClass.LIMIT })
    const marketOrder = makeOrderObject({ id: '0xs', orderClass: OrderClass.MARKET })
    const store = createStore()

    store.set(walletInfoAtom, { account: MOCK_ACCOUNT, chainId: MOCK_CHAIN })
    store.set(reduxOrdersStateAtom, {
      [MOCK_CHAIN]: {
        ...getDefaultNetworkState(MOCK_CHAIN),
        pending: {
          '0xl': limitOrder,
          '0xs': marketOrder,
        },
      },
    })

    expect(store.get(onlyPendingOrdersAtom).map((order) => order.id)).toEqual([limitOrder.id, marketOrder.id])
  })

  it('returns an empty list when wallet context is incomplete', () => {
    const store = createStore()

    store.set(walletInfoAtom, { account: undefined, chainId: MOCK_CHAIN })

    expect(store.get(onlyPendingOrdersAtom)).toEqual([])
  })
})
