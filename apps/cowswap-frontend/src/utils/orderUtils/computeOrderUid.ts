import type { Order } from '@cowprotocol/contracts'
import { OrderSigningUtils, SupportedChainId } from '@cowprotocol/cow-sdk'

export async function computeOrderUid(chainId: SupportedChainId, owner: string, order: Order): Promise<string> {
  const { computeOrderUid: _computeOrderUid } = await import('@cowprotocol/contracts')
  const domain = await OrderSigningUtils.getDomain(chainId)

  return _computeOrderUid(domain, order, owner)
}
