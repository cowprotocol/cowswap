import { TokenWithLogo } from '@cowprotocol/common-const'
import { SupportedChainId, getAddressKey } from '@cowprotocol/cow-sdk'
import { TokensByAddress } from '@cowprotocol/tokens'
import { Token } from '@uniswap/sdk-core'

import {
  buildPrototypeProxyState,
  getPrototypeProxyAddress,
  getPrototypeProxyOrderFundsState,
  getRemainingSellAmountRaw,
} from './buildPrototypeProxyState'

import { DEFAULT_TWAP_EXECUTION_INFO } from '../const'
import { TwapOrderItem, TwapOrderStatus } from '../types'

const CHAIN_ID = SupportedChainId.MAINNET
const OWNER = '0x0000000000000000000000000000000000000001'
const SELL_TOKEN = new Token(CHAIN_ID, '0x0000000000000000000000000000000000000010', 18, 'WETH', 'Wrapped Ether')
const BUY_TOKEN = new Token(CHAIN_ID, '0x0000000000000000000000000000000000000020', 6, 'USDC', 'USD Coin')

function buildOrder(
  status: TwapOrderStatus,
  executedSellAmount: string,
  overrides?: Partial<TwapOrderItem>,
): TwapOrderItem {
  return {
    id: `${status}-${executedSellAmount}`,
    chainId: CHAIN_ID,
    safeAddress: OWNER,
    submissionDate: '2026-03-11T10:00:00.000Z',
    executedDate: '2026-03-11T10:01:00.000Z',
    status,
    isPrototype: true,
    executionInfo: {
      confirmedPartsCount: 0,
      info: {
        ...DEFAULT_TWAP_EXECUTION_INFO,
        executedSellAmount,
      },
    },
    order: {
      sellToken: SELL_TOKEN.address,
      buyToken: BUY_TOKEN.address,
      receiver: OWNER,
      partSellAmount: '1000000000000000000',
      minPartLimit: '1000000',
      t0: 0,
      n: 4,
      t: 300,
      span: 0,
      appData: '0x00',
    },
    ...overrides,
  }
}

function buildTokensByAddress(...tokens: Token[]): TokensByAddress {
  return tokens.reduce<TokensByAddress>((acc, token) => {
    acc[getAddressKey(token.address)] = buildTokenWithLogo(token)

    return acc
  }, {})
}

function buildTokenWithLogo(token: Token): TokenWithLogo {
  return Object.assign(token, { logoURI: '', tags: [] })
}

describe('buildPrototypeProxyState()', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-03-11T10:02:00.000Z'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('groups active, claimable and withdrawn prototype funds separately', () => {
    const activeOrder = buildOrder(TwapOrderStatus.Pending, '1000000000000000000')
    const claimableOrder = buildOrder(TwapOrderStatus.Cancelled, '2000000000000000000')
    const claimedOrder = buildOrder(TwapOrderStatus.Cancelled, '3000000000000000000', {
      prototypeProxyFundsClaimedAt: '2026-03-11T11:00:00.000Z',
    })

    const state = buildPrototypeProxyState(
      [activeOrder, claimableOrder, claimedOrder],
      buildTokensByAddress(SELL_TOKEN, BUY_TOKEN),
    )

    expect(state.activeTokens).toHaveLength(1)
    expect(state.activeTokens[0].orderIds).toEqual([activeOrder.id])
    expect(state.activeTokens[0].amount.quotient.toString()).toBe('3000000000000000000')

    expect(state.claimableTokens).toHaveLength(1)
    expect(state.claimableTokens[0].orderIds).toEqual([claimableOrder.id])
    expect(state.claimableTokens[0].amount.quotient.toString()).toBe('2000000000000000000')

    expect(state.withdrawnTokens).toHaveLength(1)
    expect(state.withdrawnTokens[0].orderIds).toEqual([claimedOrder.id])
    expect(state.withdrawnTokens[0].amount.quotient.toString()).toBe('1000000000000000000')

    expect(state.currentTokens).toHaveLength(1)
    expect(state.currentTokens[0].orderIds).toEqual([activeOrder.id, claimableOrder.id])
    expect(state.currentTokens[0].activeOrderIds).toEqual([activeOrder.id])
    expect(state.currentTokens[0].claimableOrderIds).toEqual([claimableOrder.id])
    expect(state.currentTokens[0].amount.quotient.toString()).toBe('5000000000000000000')
  })

  it('marks active orders with withdrawn proxy funds separately from still-funded active orders', () => {
    const withdrawnActiveOrder = buildOrder(TwapOrderStatus.Pending, '1000000000000000000', {
      prototypeProxyFundsClaimedAt: '2026-03-11T11:00:00.000Z',
    })

    const state = buildPrototypeProxyState([withdrawnActiveOrder], buildTokensByAddress(SELL_TOKEN, BUY_TOKEN))

    expect(getPrototypeProxyOrderFundsState(withdrawnActiveOrder, 3000000000000000000n)).toBe('withdrawn')
    expect(state.currentTokens).toEqual([])
    expect(state.activeTokens).toEqual([])
    expect(state.claimableTokens).toEqual([])
    expect(state.withdrawnTokens).toHaveLength(1)
    expect(state.withdrawnTokens[0].orderIds).toEqual([withdrawnActiveOrder.id])
  })

  it('treats fully executed or non-final prototype orders with no balance as non-proxy funds', () => {
    const fulfilledOrder = buildOrder(TwapOrderStatus.Fulfilled, '4000000000000000000')

    expect(getRemainingSellAmountRaw(fulfilledOrder)).toBe(0n)
    expect(getPrototypeProxyOrderFundsState(fulfilledOrder, 0n)).toBe('none')
    expect(buildPrototypeProxyState([fulfilledOrder], buildTokensByAddress(SELL_TOKEN))).toEqual({
      orders: [],
      currentTokens: [],
      activeTokens: [],
      claimableTokens: [],
      withdrawnTokens: [],
    })
  })

  it('treats fully cancelled orders as auto-refunded instead of claimable', () => {
    const cancelledOrder = buildOrder(TwapOrderStatus.Cancelled, '0')

    expect(getPrototypeProxyOrderFundsState(cancelledOrder, 4000000000000000000n)).toBe('none')
    expect(buildPrototypeProxyState([cancelledOrder], buildTokensByAddress(SELL_TOKEN, BUY_TOKEN))).toEqual({
      orders: [],
      currentTokens: [],
      activeTokens: [],
      claimableTokens: [],
      withdrawnTokens: [],
    })
  })
})

describe('getPrototypeProxyAddress()', () => {
  it('returns a deterministic per-user proxy address', () => {
    expect(getPrototypeProxyAddress(OWNER, CHAIN_ID)).toBe(getPrototypeProxyAddress(OWNER, CHAIN_ID))
    expect(getPrototypeProxyAddress(OWNER, CHAIN_ID)).not.toBe(
      getPrototypeProxyAddress('0x0000000000000000000000000000000000000002', CHAIN_ID),
    )
  })
})
