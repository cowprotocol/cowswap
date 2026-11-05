import { formatAmountWithPrecision } from '@cowprotocol/common-utils'
import { OrderKind, SupportedChainId, type OrderParameters } from '@cowprotocol/cow-sdk'
import { Percent, Token } from '@cowprotocol/currency'

import { getProtocolFeeDisplayAmount } from './getProtocolFeeDisplayAmount'
import { getReceiveAmountInfo } from './getReceiveAmountInfo'

import type { ReceiveAmountInfo } from '../types'

const SELL_TOKEN = new Token(SupportedChainId.MAINNET, '0x0000000000000000000000000000000000000001', 18, 'SELL')
const BUY_TOKEN = new Token(SupportedChainId.MAINNET, '0x0000000000000000000000000000000000000002', 6, 'BUY')

const PROTOCOL_FEE_BPS = 2

function buildReceiveAmountInfo(orderParams: Partial<OrderParameters>, protocolFeeBps: number): ReceiveAmountInfo {
  return getReceiveAmountInfo({
    orderParams: { feeAmount: '0', ...orderParams } as OrderParameters,
    inputCurrency: SELL_TOKEN,
    outputCurrency: BUY_TOKEN,
    slippagePercent: new Percent(50, 10_000),
    partnerFeeBps: 0,
    protocolFeeBps,
  })
}

describe('getProtocolFeeDisplayAmount', () => {
  it('keeps a sub-atom sell order fee above zero', () => {
    const info = buildReceiveAmountInfo(
      { kind: OrderKind.SELL, sellAmount: '100000000000000000000', buyAmount: '1600' },
      PROTOCOL_FEE_BPS,
    )
    const amount = getProtocolFeeDisplayAmount(info)

    expect(info.costs.protocolFee?.amount.equalTo(0)).toBe(true)
    expect(amount?.currency).toBe(BUY_TOKEN)
    expect(amount?.greaterThan(0)).toBe(true)
    expect(formatAmountWithPrecision(amount, 6)).toBe('< 0.000001')
  })

  it('keeps a sub-atom buy order fee above zero', () => {
    const info = buildReceiveAmountInfo(
      { kind: OrderKind.BUY, sellAmount: '1600', buyAmount: '1600' },
      PROTOCOL_FEE_BPS,
    )
    const amount = getProtocolFeeDisplayAmount(info)

    expect(info.costs.protocolFee?.amount.equalTo(0)).toBe(true)
    expect(amount?.currency).toBe(SELL_TOKEN)
    expect(amount?.greaterThan(0)).toBe(true)
    expect(formatAmountWithPrecision(amount, 18)).toBe('< 0.000000000000000001')
  })

  it('returns the SDK amount when it is at least one atom', () => {
    const info = buildReceiveAmountInfo(
      { kind: OrderKind.SELL, sellAmount: '100000000000000000000', buyAmount: '16000000' },
      PROTOCOL_FEE_BPS,
    )

    expect(getProtocolFeeDisplayAmount(info)).toBe(info.costs.protocolFee?.amount)
  })

  it('returns zero when there is no protocol fee', () => {
    const info = buildReceiveAmountInfo(
      { kind: OrderKind.SELL, sellAmount: '100000000000000000000', buyAmount: '1600' },
      0,
    )

    expect(getProtocolFeeDisplayAmount(info)?.equalTo(0)).toBe(true)
  })
})
