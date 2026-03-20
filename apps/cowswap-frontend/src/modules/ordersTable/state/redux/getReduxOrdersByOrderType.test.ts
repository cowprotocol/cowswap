import { OrderClass, OrderKind, SigningScheme, SupportedChainId } from '@cowprotocol/cow-sdk'
import { UiOrderType } from '@cowprotocol/types'

import { OrderStatus } from 'legacy/state/orders/actions'
import { getDefaultNetworkState } from 'legacy/state/orders/reducer'
import type { OrderObject } from 'legacy/state/orders/reducer'
import type { SerializedToken } from 'legacy/state/user/types'

import { getReduxOrdersByOrderTypeFromNetworkState } from './getReduxOrdersByOrderType'

const MOCK_ACCOUNT = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const OTHER_OWNER = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
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

function makeOrderObject(params: { id: string; owner: string; orderClass: OrderClass }): OrderObject {
  const sell = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
  const buy = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
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

describe('getReduxOrdersByOrderTypeFromNetworkState', () => {
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

    const reduxOrdersStateInCurrentChain = {
      ...getDefaultNetworkState(MOCK_CHAIN),
      pending: { '0xm': mine, '0xt': theirs },
    }

    const { reduxOrders } = getReduxOrdersByOrderTypeFromNetworkState({
      account: MOCK_ACCOUNT,
      reduxOrdersStateInCurrentChain,
      uiOrderType: UiOrderType.LIMIT,
    })

    expect(reduxOrders.map((o) => o.id)).toEqual([mine.id])
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

    const reduxOrdersStateInCurrentChain = {
      ...getDefaultNetworkState(MOCK_CHAIN),
      pending: { '0xl': limitOrder, '0xs': marketOrder },
    }

    const limitResult = getReduxOrdersByOrderTypeFromNetworkState({
      account: MOCK_ACCOUNT,
      reduxOrdersStateInCurrentChain,
      uiOrderType: UiOrderType.LIMIT,
    })
    expect(limitResult.reduxOrders.map((o) => o.id)).toEqual([limitOrder.id])

    const swapResult = getReduxOrdersByOrderTypeFromNetworkState({
      account: MOCK_ACCOUNT,
      reduxOrdersStateInCurrentChain,
      uiOrderType: UiOrderType.SWAP,
    })
    expect(swapResult.reduxOrders.map((o) => o.id)).toEqual([marketOrder.id])
  })
})
