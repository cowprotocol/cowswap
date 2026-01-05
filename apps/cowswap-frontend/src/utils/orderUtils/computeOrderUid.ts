import { OrderSigningUtils, SupportedChainId, ContractsOrder as Order } from '@cowprotocol/cow-sdk'

export async function computeOrderUid(chainId: SupportedChainId, owner: string, order: Order): Promise<string> {
  const { computeOrderUid: _computeOrderUid } = await import('@cowprotocol/cow-sdk')
  const domain = await OrderSigningUtils.getDomain(chainId)

  return _computeOrderUid(domain, order, owner)
}
