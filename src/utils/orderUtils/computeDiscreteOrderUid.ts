import type { Order } from '@cowprotocol/contracts'
import { OrderSigningUtils, SupportedChainId } from '@cowprotocol/cow-sdk'

export async function computeDiscreteOrderUid(chainId: SupportedChainId, owner: string, order: Order): Promise<string> {
  const { computeOrderUid } = await import('@cowprotocol/contracts')
  const domain = await OrderSigningUtils.getDomain(chainId)

  return computeOrderUid(domain, order, owner)
}
