import { getAddressKey } from '@cowprotocol/cow-sdk'

import { decodeAppData } from 'modules/appData'

import { PartnerFeePolicy, ProtocolFeeType } from '../types/orderCostsAndFees.types'

const BPS_DENOMINATOR = 10_000

// `bps` is the original spelling of `volumeBps`, still found in older app data.
const POLICY_TYPE_BY_RATE_FIELD: Array<[field: string, type: ProtocolFeeType]> = [
  ['volumeBps', ProtocolFeeType.Volume],
  ['surplusBps', ProtocolFeeType.Surplus],
  ['priceImprovementBps', ProtocolFeeType.PriceImprovement],
  ['bps', ProtocolFeeType.Volume],
]

/**
 * Partner fee policies declared in an order's app data, in declaration order.
 * `undefined` when the app data can't be read, `[]` when it declares no partner fee.
 */
export function getPartnerFeePolicies(fullAppData: string | null | undefined): PartnerFeePolicy[] | undefined {
  const appData = decodeAppData(fullAppData)
  if (!appData) return undefined

  const { partnerFee } = (appData.metadata ?? {}) as { partnerFee?: unknown }
  if (!partnerFee) return []

  const declared = Array.isArray(partnerFee) ? partnerFee : [partnerFee]

  return declared.map(parsePartnerFeePolicy).filter((policy): policy is PartnerFeePolicy => policy !== null)
}

function parsePartnerFeePolicy(declared: unknown): PartnerFeePolicy | null {
  if (typeof declared !== 'object' || declared === null) return null

  const fields = declared as Record<string, unknown>
  const { recipient } = fields
  if (typeof recipient !== 'string') return null

  for (const [field, type] of POLICY_TYPE_BY_RATE_FIELD) {
    const bps = fields[field]
    if (typeof bps !== 'number' || !Number.isFinite(bps)) continue

    return { type, factor: bps / BPS_DENOMINATOR, recipient: getAddressKey(recipient) }
  }

  return null
}
