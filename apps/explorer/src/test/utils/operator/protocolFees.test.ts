import { getAddressKey } from '@cowprotocol/cow-sdk'

import { getProtocolFees } from 'utils'

import { ProtocolFeeType, RawTrade } from '../../../api/operator/types'
import { USDT, WETH } from '../../data'

type ExecutedProtocolFees = NonNullable<RawTrade['executedProtocolFees']>
type Policy = ExecutedProtocolFees[number]['policy']

const VOLUME: Policy = { volume: { factor: 0.002 } }
const SURPLUS: Policy = { surplus: { factor: 0.5, maxVolumeFactor: 0.01 } }
const PRICE_IMPROVEMENT: Policy = {
  priceImprovement: { factor: 0.5, maxVolumeFactor: 0.01, quote: { sellAmount: '1', buyAmount: '1', fee: '0' } },
}

function fill(executedProtocolFees: ExecutedProtocolFees): Pick<RawTrade, 'executedProtocolFees'> {
  return { executedProtocolFees }
}

describe('getProtocolFees', () => {
  it('returns nothing when there are no trades or no fees', () => {
    expect(getProtocolFees([])).toEqual([])
    expect(getProtocolFees([fill([])])).toEqual([])
    expect(getProtocolFees([{} as RawTrade])).toEqual([])
  })

  it('sums a fee across the fills it was charged on', () => {
    const fees = getProtocolFees([
      fill([{ amount: '100', token: USDT.address, policy: VOLUME }]),
      fill([{ amount: '250', token: USDT.address, policy: VOLUME }]),
      fill([{ amount: '50', token: USDT.address, policy: VOLUME }]),
    ])

    expect(fees).toHaveLength(1)
    expect(fees[0].amount.toString(10)).toBe('400')
    expect(fees[0].tokenAddress).toBe(getAddressKey(USDT.address))
    expect(fees[0].type).toBe(ProtocolFeeType.Volume)
  })

  it('keeps fees at different positions apart and orders them as they were applied', () => {
    const fees = getProtocolFees([
      fill([
        { amount: '100', token: WETH.address, policy: VOLUME },
        { amount: '7', token: USDT.address, policy: PRICE_IMPROVEMENT },
      ]),
      fill([
        { amount: '100', token: WETH.address, policy: VOLUME },
        { amount: '3', token: USDT.address, policy: PRICE_IMPROVEMENT },
      ]),
    ])

    expect(fees.map((fee) => [fee.position, fee.type, fee.amount.toString(10)])).toEqual([
      [0, ProtocolFeeType.Volume, '200'],
      [1, ProtocolFeeType.PriceImprovement, '10'],
    ])
  })

  // The regression this guards: keying only by position would add a WETH amount to a USDT one and
  // render the total using whichever token happened to come first.
  it('does not merge fees charged in different tokens at the same position', () => {
    const fees = getProtocolFees([
      fill([{ amount: '1000000000000000000', token: WETH.address, policy: VOLUME }]),
      fill([{ amount: '5000000', token: USDT.address, policy: VOLUME }]),
    ])

    expect(fees).toHaveLength(2)
    expect(fees.map((fee) => [fee.tokenAddress, fee.amount.toString(10)])).toEqual([
      [getAddressKey(WETH.address), '1000000000000000000'],
      [getAddressKey(USDT.address), '5000000'],
    ])
  })

  it('does not merge fees charged under different policies at the same position', () => {
    const fees = getProtocolFees([
      fill([{ amount: '100', token: USDT.address, policy: VOLUME }]),
      fill([{ amount: '400', token: USDT.address, policy: SURPLUS }]),
    ])

    expect(fees.map((fee) => [fee.type, fee.amount.toString(10)])).toEqual([
      [ProtocolFeeType.Volume, '100'],
      [ProtocolFeeType.Surplus, '400'],
    ])
  })

  it('handles fills that carry a different number of fees', () => {
    const fees = getProtocolFees([
      fill([
        { amount: '100', token: USDT.address, policy: VOLUME },
        { amount: '20', token: USDT.address, policy: SURPLUS },
      ]),
      fill([{ amount: '100', token: USDT.address, policy: VOLUME }]),
    ])

    expect(fees.map((fee) => [fee.position, fee.amount.toString(10)])).toEqual([
      [0, '200'],
      [1, '20'],
    ])
  })

  it('classifies a missing or unrecognised policy as unknown', () => {
    const fees = getProtocolFees([fill([{ amount: '100', token: USDT.address } as ExecutedProtocolFees[number]])])

    expect(fees[0].type).toBe(ProtocolFeeType.Unknown)
  })

  it('skips entries with no amount or no token, and policies that charged nothing', () => {
    const fees = getProtocolFees([
      fill([
        { amount: '0', token: USDT.address, policy: VOLUME },
        { amount: '', token: USDT.address, policy: SURPLUS },
        { amount: '100', token: '', policy: SURPLUS },
        { amount: '5', token: WETH.address, policy: SURPLUS },
      ]),
    ])

    expect(fees).toHaveLength(1)
    expect(fees[0].amount.toString(10)).toBe('5')
    expect(fees[0].tokenAddress).toBe(getAddressKey(WETH.address))
  })
})
