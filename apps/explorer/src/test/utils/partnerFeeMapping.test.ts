import { ProtocolFeeOwner, ProtocolFeeType, RawTrade, Trade } from '../../api/operator/types'
import { getProtocolFees } from '../../utils/operator'
import { getPartnerFeePolicies } from '../../utils/partnerFeePolicies'

type ExecutedFee = NonNullable<RawTrade['executedProtocolFees']>[number]
type Policy = ExecutedFee['policy']

const VOLUME_20_BPS: Policy = { volume: { factor: 0.002 } }
const VOLUME_10_BPS: Policy = { volume: { factor: 0.001 } }
const SURPLUS_POLICY: Policy = { surplus: { factor: 0.5, maxVolumeFactor: 0.01 } }

const TOKEN = '0xdac17f958d2ee523a2206206994597c13d831ec7'
const PARTNER = '0x1111111111111111111111111111111111111111'

function appData(partnerFee?: unknown): string {
  return JSON.stringify({ version: '1.1.0', metadata: partnerFee ? { partnerFee } : {} })
}

function fee(policy: Policy, amount = '1000'): ExecutedFee {
  return { amount, token: TOKEN, policy }
}

function owners(fullAppData: string | undefined, ...fees: ExecutedFee[]): ProtocolFeeOwner[] {
  return getProtocolFees([trade(...fees)], getPartnerFeePolicies(fullAppData)).map((f) => f.owner)
}

function trade(...fees: ExecutedFee[]): Pick<Trade, 'executedProtocolFees'> {
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
  const { Protocol, Partner, Unknown } = ProtocolFeeOwner

  it('attributes the trailing declared policies to the partner and the rest to the protocol', () => {
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

    expect(partnerFee).toMatchObject({ owner: Partner, recipient: PARTNER })
  })

  it('accepts a partner fee the protocol capped below the declared rate', () => {
    expect(owners(appData({ volumeBps: 200, recipient: PARTNER }), fee(VOLUME_20_BPS), fee(VOLUME_10_BPS))).toEqual([
      Protocol,
      Partner,
    ])
  })

  it('attributes nothing when the applied policies do not match what was declared', () => {
    // Declared a volume fee, but the last applied policy charges on surplus.
    expect(owners(appData({ volumeBps: 10, recipient: PARTNER }), fee(VOLUME_20_BPS), fee(SURPLUS_POLICY))).toEqual([
      Unknown,
      Unknown,
    ])

    // Declared more partner policies than the order applied.
    expect(
      owners(
        appData([
          { volumeBps: 10, recipient: PARTNER },
          { surplusBps: 100, maxVolumeBps: 100 },
        ]),
        fee(VOLUME_10_BPS),
      ),
    ).toEqual([Unknown])
  })

  it('attributes nothing when the order has no app data to map against', () => {
    expect(owners(undefined, fee(VOLUME_20_BPS), fee(VOLUME_10_BPS))).toEqual([Unknown, Unknown])
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
