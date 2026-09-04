import { ProtocolFeeOwner, ProtocolFeeType, RawTrade } from '../../api/operator/types'
import { getProtocolFees } from '../../utils/operator'
import { getPartnerFeePolicies } from '../../utils/partnerFeePolicies'

type ExecutedFee = NonNullable<RawTrade['executedProtocolFees']>[number]
type Policy = ExecutedFee['policy']

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
const PARTNER = '0x1111111111111111111111111111111111111111'
const OTHER_PARTNER = '0x2222222222222222222222222222222222222222'

function appData(partnerFee?: unknown): string {
  return JSON.stringify({ version: '1.1.0', metadata: partnerFee ? { partnerFee } : {} })
}

function fee(policy: Policy, amount = '1000'): ExecutedFee {
  return { amount, token: TOKEN, policy }
}

function owners(fullAppData: string | undefined, ...fees: ExecutedFee[]): ProtocolFeeOwner[] {
  return getProtocolFees([trade(...fees)], getPartnerFeePolicies(fullAppData)).map((f) => f.owner)
}

function partners(fullAppData: string | undefined, ...fees: ExecutedFee[]): Array<number | undefined> {
  return getProtocolFees([trade(...fees)], getPartnerFeePolicies(fullAppData)).map((f) => f.partnerNumber)
}

function trade(...fees: ExecutedFee[]): Pick<RawTrade, 'executedProtocolFees'> {
  return { executedProtocolFees: fees }
}

describe('getPartnerFeePolicies', () => {
  it('distinguishes unreadable app data from app data declaring no partner fee', () => {
    expect(getPartnerFeePolicies(undefined)).toBeUndefined()
    expect(getPartnerFeePolicies('not json')).toBeUndefined()
    expect(getPartnerFeePolicies(appData())).toEqual([])
  })

  it('reads a single policy, a list of policies, and each policy shape', () => {
    expect(getPartnerFeePolicies(appData({ volumeBps: 20, recipient: PARTNER }))).toEqual([
      { type: ProtocolFeeType.Volume, factor: 0.002, recipient: PARTNER },
    ])

    expect(
      getPartnerFeePolicies(
        appData([
          { surplusBps: 5000, maxVolumeBps: 100, recipient: PARTNER },
          { priceImprovementBps: 2500, maxVolumeBps: 100, recipient: PARTNER },
        ]),
      ),
    ).toEqual([
      { type: ProtocolFeeType.Surplus, factor: 0.5, recipient: PARTNER },
      { type: ProtocolFeeType.PriceImprovement, factor: 0.25, recipient: PARTNER },
    ])
  })

  it('reads the legacy volume-only spelling, and skips policies without a rate', () => {
    expect(getPartnerFeePolicies(appData({ bps: 20, recipient: PARTNER }))).toEqual([
      { type: ProtocolFeeType.Volume, factor: 0.002, recipient: PARTNER },
    ])
    expect(getPartnerFeePolicies(appData([{ recipient: PARTNER }, 'nonsense']))).toEqual([])
  })
})

describe('protocol fee attribution', () => {
  const { Protocol, Partner } = ProtocolFeeOwner

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

    expect(partnerFee).toMatchObject({ owner: Partner, recipient: PARTNER, partnerNumber: 1 })
  })

  it('accepts a partner fee the protocol capped below the declared rate', () => {
    expect(owners(appData({ volumeBps: 200, recipient: PARTNER }), fee(VOLUME_20_BPS), fee(VOLUME_10_BPS))).toEqual([
      Protocol,
      Partner,
    ])
  })

  it('matches within a fee type, so a partner fee the protocol did not apply last still resolves', () => {
    // The ordering the autopilot is planned to move to: grouped by type, not partner fees last.
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
    // Declared 10 bps, but the only volume fee charged more than that, so it cannot be the partner's.
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
          { surplusBps: 100, maxVolumeBps: 100 },
        ]),
        fee(VOLUME_10_BPS),
      ),
    ).toEqual([Partner])
  })

  it('uses the positional rule when the order has no app data to map against', () => {
    // The protocol's policy of a type is always applied before any partner's.
    expect(owners(undefined, fee(VOLUME_20_BPS), fee(VOLUME_10_BPS))).toEqual([Protocol, Partner])
    expect(owners(undefined, fee(SURPLUS_POLICY), fee(VOLUME_20_BPS))).toEqual([Protocol, Protocol])
  })

  it('keeps the partner boundary when a fee policy charged nothing', () => {
    // The zero-amount fee is dropped from the result but still counts as an applied policy.
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

    expect(fees.map((f) => [f.amount.toString(10), f.owner])).toEqual([
      ['3000', Protocol],
      ['1000', Partner],
    ])
  })
})

describe('partner numbering', () => {
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
    // Kerberus injects its own volume fee on top of the integrator's.
    const declared = appData([
      { volumeBps: 25, recipient: PARTNER },
      { volumeBps: 10, recipient: OTHER_PARTNER },
    ])

    expect(partners(declared, fee(VOLUME_20_BPS), fee(VOLUME_25_BPS), fee(VOLUME_10_BPS))).toEqual([undefined, 1, 2])
  })

  it('numbers a recipient the same however its address is cased', () => {
    const declared = appData([
      { volumeBps: 10, recipient: PARTNER.toUpperCase().replace('0X', '0x') },
      { priceImprovementBps: 2500, maxVolumeBps: 100, recipient: PARTNER },
    ])

    expect(partners(declared, fee(VOLUME_10_BPS), fee(PRICE_IMPROVEMENT_POLICY))).toEqual([1, 1])
  })

  it('counts one partner using a different recipient per fee kind as two partners', () => {
    // Accepted limitation, see `numberPartners`: nothing in the app data says which recipient
    // addresses belong to the same integrator.
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
