import { getAddressKey } from '@cowprotocol/cow-sdk'

import { getPartnerFeePolicies } from './partnerFeePolicies.utils'

import { ProtocolFeeType } from '../types/orderCostsAndFees.types'

const PARTNER = '0x1111111111111111111111111111111111111111'

function appData(partnerFee?: unknown): string {
  return JSON.stringify({ version: '1.1.0', metadata: partnerFee ? { partnerFee } : {} })
}

describe('getPartnerFeePolicies', () => {
  it('distinguishes unreadable app data from app data declaring no partner fee', () => {
    expect(getPartnerFeePolicies(undefined)).toBeUndefined()
    expect(getPartnerFeePolicies('not json')).toBeUndefined()
    expect(getPartnerFeePolicies(appData())).toEqual([])
  })

  it('reads a single policy, a list of policies, and each policy shape', () => {
    expect(getPartnerFeePolicies(appData({ volumeBps: 20, recipient: PARTNER }))).toEqual([
      { type: ProtocolFeeType.Volume, factor: 0.002, recipient: getAddressKey(PARTNER) },
    ])

    expect(
      getPartnerFeePolicies(
        appData([
          { surplusBps: 5000, maxVolumeBps: 100, recipient: PARTNER },
          { priceImprovementBps: 2500, maxVolumeBps: 100, recipient: PARTNER },
        ]),
      ),
    ).toEqual([
      { type: ProtocolFeeType.Surplus, factor: 0.5, recipient: getAddressKey(PARTNER) },
      { type: ProtocolFeeType.PriceImprovement, factor: 0.25, recipient: getAddressKey(PARTNER) },
    ])
  })

  it('reads the legacy volume-only spelling, and skips policies without a rate or a recipient', () => {
    expect(getPartnerFeePolicies(appData({ bps: 20, recipient: PARTNER }))).toEqual([
      { type: ProtocolFeeType.Volume, factor: 0.002, recipient: getAddressKey(PARTNER) },
    ])
    expect(getPartnerFeePolicies(appData([{ recipient: PARTNER }, { volumeBps: 20 }, 'nonsense']))).toEqual([])
  })

  it('normalises the recipient, so differently cased spellings compare equal', () => {
    const checksummed = '0xaBcDeF0123456789aBcDeF0123456789aBcDeF01'

    expect(getPartnerFeePolicies(appData({ volumeBps: 20, recipient: checksummed }))?.[0].recipient).toBe(
      getAddressKey(checksummed),
    )
  })
})
