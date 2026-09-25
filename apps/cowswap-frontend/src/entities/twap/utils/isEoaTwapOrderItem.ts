import { areAddressesEqual } from '@cowprotocol/cow-sdk'

type TwapOwnerFields = {
  safeAddress: string
  /** Persisted v1 Safe orders predate resolvedOwner. */
  resolvedOwner?: string
}

/** EOA TWAP when the ComposableCoW/proxy address differs from the canonical EOA owner. */
export function isEoaTwapOrderItem(order: TwapOwnerFields): boolean {
  const resolvedOwner = order.resolvedOwner ?? order.safeAddress

  return !areAddressesEqual(order.safeAddress, resolvedOwner)
}
