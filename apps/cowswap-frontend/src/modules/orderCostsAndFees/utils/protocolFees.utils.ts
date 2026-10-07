import { FeePolicy, getAddressKey, Trade } from '@cowprotocol/cow-sdk'

import { PartnerFeePolicy, ProtocolFee, ProtocolFeeOwner, ProtocolFeeType } from '../types/orderCostsAndFees.types'

// Absorbs the rounding of bps to a fraction when comparing rates.
const RATE_EPSILON = 1e-9

/**
 * The fees charged across an order's fills, one total per (position, type, token), in the order applied.
 * Position alone is not a safe key: across fills it can carry a different token or policy.
 */
export function getProtocolFees(
  trades: Array<Pick<Trade, 'executedProtocolFees'>>,
  partnerFeePolicies?: PartnerFeePolicy[],
): ProtocolFee[] {
  const feesByPolicy = new Map<string, ProtocolFee>()

  for (const { executedProtocolFees } of trades) {
    executedProtocolFees?.forEach(({ amount: rawAmount, token, policy }, position) => {
      const amount = rawAmount ? parseIntegerAmount(rawAmount) : null
      if (amount === null || !token) return

      const { type, factor } = describeFeePolicy(policy)
      const tokenAddress = getAddressKey(token)
      const key = `${position}-${type}-${tokenAddress}`
      const existing = feesByPolicy.get(key)

      if (existing) {
        existing.amount += amount
      } else {
        feesByPolicy.set(key, {
          amount,
          tokenAddress,
          type,
          factor,
          position,
          owner: ProtocolFeeOwner.Protocol,
        })
      }
    })
  }

  const fees = Array.from(feesByPolicy.values()).sort((a, b) => a.position - b.position)

  // Before dropping zero amounts: an empty policy still occupies its place in its type's run.
  attributeFeeOwners(fees, partnerFeePolicies)

  const charged = fees.filter((fee) => fee.amount > 0n)

  numberPartners(charged)

  return charged
}

/** The API serves amounts as integer strings; a malformed one yields `null` instead of crashing the render. */
export function parseIntegerAmount(amount: string): bigint | null {
  try {
    return BigInt(amount)
  } catch {
    return null
  }
}

/**
 * Within one fee type the protocol's policy is applied before any partner's, and partner policies keep
 * their app data order. Each type's declarations are matched against the end of that type's run; if
 * they don't line up, or there's no app data, the first fee of a type is the protocol's and the rest
 * are partners'.
 */
function attributeFeeOwners(fees: ProtocolFee[], partnerFeePolicies: PartnerFeePolicy[] | undefined): void {
  const declaredByType = groupBy(partnerFeePolicies ?? [], (policy) => policy.type)

  for (const [type, typeFees] of groupBy(fees, (fee) => fee.type)) {
    // `undefined`: nothing to check against. `[]`: app data declares no partner fee of this type.
    const declared = partnerFeePolicies && (declaredByType.get(type) ?? [])

    attributeTypeOwners(typeFees, declared)
  }
}

function attributeTypeOwners(typeFees: ProtocolFee[], declared: PartnerFeePolicy[] | undefined): void {
  const matched = declared && matchDeclaredPolicies(typeFees, declared)
  const partnerStart = matched ? typeFees.length - matched.length : 1

  typeFees.forEach((fee, index) => {
    if (index < partnerStart) {
      fee.owner = ProtocolFeeOwner.Protocol
      return
    }

    fee.owner = ProtocolFeeOwner.Partner
    fee.recipient = matched?.[index - partnerStart].recipient
  })
}

function describeFeePolicy(policy: FeePolicy | undefined): Pick<ProtocolFee, 'type' | 'factor'> {
  if (policy) {
    if ('surplus' in policy) return { type: ProtocolFeeType.Surplus, factor: policy.surplus.factor }
    if ('volume' in policy) return { type: ProtocolFeeType.Volume, factor: policy.volume.factor }
    if ('priceImprovement' in policy) {
      return { type: ProtocolFeeType.PriceImprovement, factor: policy.priceImprovement.factor }
    }
  }
  return { type: ProtocolFeeType.Unknown }
}

function groupBy<T, K>(items: T[], keyOf: (item: T) => K): Map<K, T[]> {
  const groups = new Map<K, T[]>()

  for (const item of items) {
    const key = keyOf(item)
    const group = groups.get(key)
    if (group) group.push(item)
    else groups.set(key, [item])
  }

  return groups
}

function matchDeclaredPolicies(typeFees: ProtocolFee[], declared: PartnerFeePolicy[]): PartnerFeePolicy[] | undefined {
  // A partner can declare a policy the order never applied, so match only as far as both go.
  const matched = declared.slice(Math.max(0, declared.length - typeFees.length))
  const partnerStart = typeFees.length - matched.length

  const linesUp = matched.every((policy, index) => {
    const position = partnerStart + index
    return matchesDeclaredRate(typeFees[position], policy, position === 0)
  })

  return linesUp ? matched : undefined
}

/**
 * The protocol caps partner fees, so the applied rate can be below the declared one, never above. At the
 * head of a type's run it must be equal: that's where the protocol's own policy sits, and its rate is
 * below most declared partner rates, so a declared-but-unapplied partner fee would otherwise claim it.
 */
function matchesDeclaredRate(fee: ProtocolFee, declared: PartnerFeePolicy, exact: boolean): boolean {
  if (fee.factor === undefined) return true

  const difference = fee.factor - declared.factor
  return exact ? Math.abs(difference) <= RATE_EPSILON : difference <= RATE_EPSILON
}

/**
 * Fees sharing a recipient share a number, telling one partner charging two fees apart from two partners
 * (e.g. an injected wallet fee on top of the integrator's). One integrator using two recipients counts as
 * two partners: app data doesn't say which addresses belong together.
 */
function numberPartners(fees: ProtocolFee[]): void {
  const numberByPartner = new Map<string, number>()

  for (const fee of fees) {
    if (fee.owner !== ProtocolFeeOwner.Partner) continue

    const key = fee.recipient ?? `${fee.position}-${fee.type}`
    let number = numberByPartner.get(key)

    if (number === undefined) {
      number = numberByPartner.size + 1
      numberByPartner.set(key, number)
    }

    fee.partnerNumber = number
  }
}
