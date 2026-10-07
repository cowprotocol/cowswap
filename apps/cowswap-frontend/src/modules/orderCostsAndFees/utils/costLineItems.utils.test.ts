import { i18n } from '@lingui/core'

import { getAddressKey } from '@cowprotocol/cow-sdk'

import { buildCostLineItems, sumByToken } from './costLineItems.utils'

import { CostLineItem, ProtocolFee, ProtocolFeeOwner, ProtocolFeeType } from '../types/orderCostsAndFees.types'

i18n.load('en-US', {})
i18n.activate('en-US')

const NATIVE_KEY = getAddressKey('0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee')
const USDT = getAddressKey('0xdac17f958d2ee523a2206206994597c13d831ec7')
const WETH = getAddressKey('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2')
const GAS_COST = 2500000000000000n

function fee(
  type: ProtocolFeeType,
  tokenAddress = USDT,
  amount = 1n,
  owner = ProtocolFeeOwner.Protocol,
  partnerNumber?: number,
): ProtocolFee {
  return { type, tokenAddress, amount, position: 0, owner, partnerNumber }
}

function labels(items: CostLineItem[]): string[] {
  return items.map((item) => i18n._(item.label) + (item.occurrence ? ` (${item.occurrence})` : ''))
}

describe('buildCostLineItems', () => {
  it('puts the network costs first, in the native token', () => {
    const [first] = buildCostLineItems([fee(ProtocolFeeType.Volume)], GAS_COST, NATIVE_KEY)

    expect(i18n._(first.label)).toBe('Network costs')
    expect(first).toMatchObject({ tokenAddress: NATIVE_KEY, amount: GAS_COST })
  })

  it('names the protocol fees and numbers the partners, per the agreed labels', () => {
    const items = buildCostLineItems(
      [
        fee(ProtocolFeeType.PriceImprovement, WETH),
        fee(ProtocolFeeType.Volume, WETH),
        fee(ProtocolFeeType.Volume, USDT, 3n, ProtocolFeeOwner.Partner, 1),
        fee(ProtocolFeeType.PriceImprovement, USDT, 4n, ProtocolFeeOwner.Partner, 1),
        fee(ProtocolFeeType.Volume, USDT, 5n, ProtocolFeeOwner.Partner, 2),
      ],
      GAS_COST,
      NATIVE_KEY,
    )

    expect(labels(items)).toEqual([
      'Network costs',
      'DAO price improvement share',
      'Protocol fee',
      'Partner 1 volume fee',
      'Partner 1 price improvement share',
      'Partner 2 volume fee',
    ])
  })

  it('labels the protocol surplus fee as the DAO price improvement share', () => {
    expect(labels(buildCostLineItems([fee(ProtocolFeeType.Surplus)], GAS_COST, NATIVE_KEY))[1]).toBe(
      'DAO price improvement share',
    )
  })

  it('falls back to the plain names for an unrecognised policy', () => {
    const items = buildCostLineItems(
      [fee(ProtocolFeeType.Unknown), fee(ProtocolFeeType.Unknown, USDT, 2n, ProtocolFeeOwner.Partner, 1)],
      GAS_COST,
      NATIVE_KEY,
    )

    expect(labels(items)).toEqual(['Network costs', 'Protocol fee', 'Partner 1 fee'])
  })

  it('numbers a label that still repeats, so the rows stay distinguishable', () => {
    const items = buildCostLineItems(
      [
        fee(ProtocolFeeType.Volume, WETH, 1n, ProtocolFeeOwner.Partner, 1),
        fee(ProtocolFeeType.Surplus, WETH, 2n),
        fee(ProtocolFeeType.Volume, USDT, 3n, ProtocolFeeOwner.Partner, 1),
      ],
      GAS_COST,
      NATIVE_KEY,
    )

    expect(labels(items)).toEqual([
      'Network costs',
      'Partner 1 volume fee (1)',
      'DAO price improvement share',
      'Partner 1 volume fee (2)',
    ])
  })
})

describe('sumByToken', () => {
  it('totals per token, keeping first-seen order, wrapped native apart from native', () => {
    const items = buildCostLineItems(
      [
        fee(ProtocolFeeType.Volume, USDT, 10n),
        fee(ProtocolFeeType.Surplus, WETH, 7n),
        fee(ProtocolFeeType.Volume, USDT, 5n),
      ],
      GAS_COST,
      NATIVE_KEY,
    )

    expect(sumByToken(items)).toEqual([
      [NATIVE_KEY, GAS_COST],
      [USDT, 15n],
      [WETH, 7n],
    ])
  })
})
