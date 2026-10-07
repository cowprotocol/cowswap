import { getAddressKey, Trade } from '@cowprotocol/cow-sdk'

import { getPartnerFeePolicies } from './partnerFeePolicies.utils'
import { getProtocolFees } from './protocolFees.utils'

import { ProtocolFeeOwner, ProtocolFeeType } from '../types/orderCostsAndFees.types'

type ExecutedFee = NonNullable<Trade['executedProtocolFees']>[number]
type Policy = NonNullable<ExecutedFee['policy']>

const VOLUME_25_BPS: Policy = { volume: { factor: 0.0025 } }
const VOLUME_20_BPS: Policy = { volume: { factor: 0.002 } }
const VOLUME_10_BPS: Policy = { volume: { factor: 0.001 } }
const SURPLUS_POLICY: Policy = { surplus: { factor: 0.5, maxVolumeFactor: 0.01 } }
const PRICE_IMPROVEMENT_POLICY: Policy = {
  priceImprovement: {
    factor: 0.25,
    maxVolumeFactor: 0.01,
    quote: { sellAmount: '1000', buyAmount: '2000', fee: '10' },
  },
}

const TOKEN = '0xdac17f958d2ee523a2206206994597c13d831ec7'
const OTHER_TOKEN = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const PARTNER = '0x1111111111111111111111111111111111111111'
const OTHER_PARTNER = '0x2222222222222222222222222222222222222222'
const { Protocol, Partner } = ProtocolFeeOwner

function appData(partnerFee?: unknown): string {
  return JSON.stringify({ version: '1.1.0', metadata: partnerFee ? { partnerFee } : {} })
}

function fee(policy: Policy, amount = '1000', token = TOKEN): ExecutedFee {
  return { amount, token, policy }
}

function owners(fullAppData: string | undefined, ...fees: ExecutedFee[]): ProtocolFeeOwner[] {
  return getProtocolFees([trade(...fees)], getPartnerFeePolicies(fullAppData)).map((f) => f.owner)
}

function partners(fullAppData: string | undefined, ...fees: ExecutedFee[]): Array<number | undefined> {
  return getProtocolFees([trade(...fees)], getPartnerFeePolicies(fullAppData)).map((f) => f.partnerNumber)
}

function trade(...fees: ExecutedFee[]): Pick<Trade, 'executedProtocolFees'> {
  return { executedProtocolFees: fees }
}

describe('getProtocolFees aggregation', () => {
  it('returns nothing for no trades, no fees, or a trade without the field', () => {
    expect(getProtocolFees([])).toEqual([])
    expect(getProtocolFees([trade()])).toEqual([])
    expect(getProtocolFees([{}])).toEqual([])
  })

  it('skips fees whose amount is not an integer string instead of throwing', () => {
    const fees = getProtocolFees([
      trade(fee(VOLUME_20_BPS, '1.5'), fee(SURPLUS_POLICY, '300')),
      trade(fee(VOLUME_20_BPS, '1000'), fee(SURPLUS_POLICY, 'abc')),
    ])

    expect(fees.map(({ type, amount }) => [type, amount])).toEqual([
      [ProtocolFeeType.Volume, 1000n],
      [ProtocolFeeType.Surplus, 300n],
    ])
  })

  it('sums the same policy across fills and drops zero amounts', () => {
    const fees = getProtocolFees([
      trade(fee(VOLUME_20_BPS, '1000'), fee(SURPLUS_POLICY, '0')),
      trade(fee(VOLUME_20_BPS, '2000'), fee(SURPLUS_POLICY, '0')),
    ])

    expect(fees).toHaveLength(1)
    expect(fees[0]).toMatchObject({ amount: 3000n, type: ProtocolFeeType.Volume, factor: 0.002, position: 0 })
  })

  it('keeps fees in different tokens at the same position apart', () => {
    const fees = getProtocolFees([trade(fee(VOLUME_20_BPS, '1', TOKEN)), trade(fee(VOLUME_20_BPS, '2', OTHER_TOKEN))])

    expect(fees.map((f) => [f.tokenAddress, f.amount])).toEqual([
      [getAddressKey(TOKEN), 1n],
      [getAddressKey(OTHER_TOKEN), 2n],
    ])
  })

  it('skips entries without an amount or a token', () => {
    const input = [trade({ policy: VOLUME_20_BPS, token: TOKEN }), trade({ policy: VOLUME_20_BPS, amount: '1' })]
    expect(getProtocolFees(input)).toEqual([])
  })
})

describe('getProtocolFees attribution', () => {
  it('attributes the declared policies to the partner and the rest to the protocol', () => {
    expect(owners(appData({ volumeBps: 10, recipient: PARTNER }), fee(SURPLUS_POLICY), fee(VOLUME_10_BPS))).toEqual([
      Protocol,
      Partner,
    ])
  })

  it('attributes every fee to the protocol when no partner fee was declared', () => {
    expect(owners(appData(), fee(VOLUME_20_BPS), fee(SURPLUS_POLICY))).toEqual([Protocol, Protocol])
  })

  it('carries the declared recipient onto the partner fee', () => {
    const [, partnerFee] = getProtocolFees(
      [trade(fee(VOLUME_20_BPS), fee(VOLUME_10_BPS))],
      getPartnerFeePolicies(appData({ volumeBps: 10, recipient: PARTNER })),
    )

    expect(partnerFee).toMatchObject({ owner: Partner, recipient: getAddressKey(PARTNER), partnerNumber: 1 })
  })

  it('accepts a partner fee the protocol capped below the declared rate', () => {
    expect(owners(appData({ volumeBps: 200, recipient: PARTNER }), fee(VOLUME_20_BPS), fee(VOLUME_10_BPS))).toEqual([
      Protocol,
      Partner,
    ])
  })

  it('matches within a fee type, so a partner fee not applied last still resolves', () => {
    expect(
      owners(
        appData({ volumeBps: 10, recipient: PARTNER }),
        fee(VOLUME_20_BPS),
        fee(VOLUME_10_BPS),
        fee(SURPLUS_POLICY),
      ),
    ).toEqual([Protocol, Partner, Protocol])
  })

  it('falls back to the positional rule when the applied policies do not match what was declared', () => {
    expect(owners(appData({ volumeBps: 10, recipient: PARTNER }), fee(VOLUME_20_BPS), fee(SURPLUS_POLICY))).toEqual([
      Protocol,
      Protocol,
    ])
  })

  it("attributes a declared policy the order applied without one of the protocol's own", () => {
    expect(
      owners(
        appData([
          { volumeBps: 10, recipient: PARTNER },
          { surplusBps: 100, maxVolumeBps: 100, recipient: PARTNER },
        ]),
        fee(VOLUME_10_BPS),
      ),
    ).toEqual([Partner])
  })

  it("keeps a declared but unapplied partner fee off the protocol's own cheaper fee", () => {
    const declared = appData({ volumeBps: 30, recipient: PARTNER })
    const protocolVolume: Policy = { volume: { factor: 0.0002 } }

    expect(owners(declared, fee(PRICE_IMPROVEMENT_POLICY), fee(protocolVolume))).toEqual([Protocol, Protocol])
  })

  it('does not shift a missing declared policy onto the head of the run', () => {
    const declared = appData([
      { volumeBps: 25, recipient: PARTNER },
      { volumeBps: 10, recipient: OTHER_PARTNER },
    ])
    const protocolVolume: Policy = { volume: { factor: 0.0002 } }

    const fees = getProtocolFees([trade(fee(protocolVolume), fee(VOLUME_10_BPS))], getPartnerFeePolicies(declared))

    expect(fees.map((f) => [f.owner, f.recipient])).toEqual([
      [Protocol, undefined],
      [Partner, undefined],
    ])
  })

  it('uses the positional rule when the order has no app data to map against', () => {
    expect(owners(undefined, fee(VOLUME_20_BPS), fee(VOLUME_10_BPS))).toEqual([Protocol, Partner])
    expect(owners(undefined, fee(SURPLUS_POLICY), fee(VOLUME_20_BPS))).toEqual([Protocol, Protocol])
  })

  it('keeps the partner boundary when a fee policy charged nothing', () => {
    const fees = getProtocolFees(
      [trade(fee(SURPLUS_POLICY, '0'), fee(VOLUME_20_BPS), fee(VOLUME_10_BPS))],
      getPartnerFeePolicies(appData({ volumeBps: 10, recipient: PARTNER })),
    )

    expect(fees.map((f) => [f.position, f.owner])).toEqual([
      [1, Protocol],
      [2, Partner],
    ])
  })

  it('sums each policy across fills without disturbing attribution', () => {
    const fills = [
      trade(fee(VOLUME_20_BPS, '1000'), fee(VOLUME_10_BPS, '400')),
      trade(fee(VOLUME_20_BPS, '2000'), fee(VOLUME_10_BPS, '600')),
    ]

    const fees = getProtocolFees(fills, getPartnerFeePolicies(appData({ volumeBps: 10, recipient: PARTNER })))

    expect(fees.map((f) => [f.amount, f.owner])).toEqual([
      [3000n, Protocol],
      [1000n, Partner],
    ])
  })
})

describe('getProtocolFees partner numbering', () => {
  it('gives one partner charging two kinds of fee the same number', () => {
    const declared = appData([
      { volumeBps: 10, recipient: PARTNER },
      { priceImprovementBps: 2500, maxVolumeBps: 100, recipient: PARTNER },
    ])

    expect(partners(declared, fee(VOLUME_20_BPS), fee(VOLUME_10_BPS), fee(PRICE_IMPROVEMENT_POLICY))).toEqual([
      undefined,
      1,
      1,
    ])
  })

  it('numbers two partners charging the same kind of fee separately', () => {
    const declared = appData([
      { volumeBps: 25, recipient: PARTNER },
      { volumeBps: 10, recipient: OTHER_PARTNER },
    ])

    expect(partners(declared, fee(VOLUME_20_BPS), fee(VOLUME_25_BPS), fee(VOLUME_10_BPS))).toEqual([undefined, 1, 2])
  })

  it('counts one partner using a different recipient per fee kind as two partners', () => {
    const declared = appData([
      { volumeBps: 10, recipient: PARTNER },
      { priceImprovementBps: 2500, maxVolumeBps: 100, recipient: OTHER_PARTNER },
    ])

    expect(partners(declared, fee(VOLUME_10_BPS), fee(PRICE_IMPROVEMENT_POLICY))).toEqual([1, 2])
  })

  it('starts at 1 with no gaps when a partner fee charged nothing', () => {
    const declared = appData([
      { volumeBps: 25, recipient: PARTNER },
      { volumeBps: 10, recipient: OTHER_PARTNER },
    ])

    expect(partners(declared, fee(VOLUME_20_BPS), fee(VOLUME_25_BPS, '0'), fee(VOLUME_10_BPS, '500'))).toEqual([
      undefined,
      1,
    ])
  })

  it('counts a partner fee with no known recipient as its own partner', () => {
    expect(partners(undefined, fee(VOLUME_20_BPS), fee(VOLUME_25_BPS), fee(VOLUME_10_BPS))).toEqual([undefined, 1, 2])
  })
})
