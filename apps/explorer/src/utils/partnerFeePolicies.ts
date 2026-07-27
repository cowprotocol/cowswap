import { ProtocolFeeType } from 'api/operator/types'

import { decodeFullAppData } from './decodeFullAppData'

export type PartnerFeePolicy = {
  type: ProtocolFeeType
  /** Declared rate as a fraction (bps / 10 000), in the same units as `FeePolicy.factor`. */
  factor: number
  recipient?: string
}

const BPS_DENOMINATOR = 10_000

// `bps` is the original spelling of `volumeBps`, still used by older app data.
const POLICY_TYPE_BY_RATE_FIELD: Array<[field: string, type: ProtocolFeeType]> = [
  ['volumeBps', ProtocolFeeType.Volume],
  ['surplusBps', ProtocolFeeType.Surplus],
  ['priceImprovementBps', ProtocolFeeType.PriceImprovement],
  ['bps', ProtocolFeeType.Volume],
]

/**
 * Partner fee policies declared in an order's app data, in declaration order.
 *
 * `undefined` when the app data can't be read, as opposed to `[]` for app data declaring no partner
 * fee — an order without app data can still have been charged partner fees.
 */
export function getPartnerFeePolicies(fullAppData: string | null | undefined): PartnerFeePolicy[] | undefined {
  const appData = decodeFullAppData(fullAppData)
  if (!appData) return undefined

  const { partnerFee } = (appData.metadata ?? {}) as { partnerFee?: unknown }
  if (!partnerFee) return []

  const declared = Array.isArray(partnerFee) ? partnerFee : [partnerFee]

  return declared.map(parsePartnerFeePolicy).filter((policy): policy is PartnerFeePolicy => policy !== null)
}

function parsePartnerFeePolicy(declared: unknown): PartnerFeePolicy | null {
  if (typeof declared !== 'object' || declared === null) return null

  const fields = declared as Record<string, unknown>

  for (const [field, type] of POLICY_TYPE_BY_RATE_FIELD) {
    const bps = fields[field]
    if (typeof bps !== 'number' || !Number.isFinite(bps)) continue

    return {
      type,
      factor: bps / BPS_DENOMINATOR,
      recipient: typeof fields.recipient === 'string' ? fields.recipient : undefined,
    }
  }

  return null
}
