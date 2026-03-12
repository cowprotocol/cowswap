import { COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS, isBarnBackendEnv } from '@cowprotocol/common-utils'
import { OrderSigningUtils, SupportedChainId, ContractsOrder as Order, AddressPerChain } from '@cowprotocol/cow-sdk'

export async function computeOrderUid(
  chainId: SupportedChainId,
  owner: string,
  order: Order,
  settlementContractOverride?: AddressPerChain,
): Promise<string> {
  const { computeOrderUid: _computeOrderUid } = await import('@cowprotocol/cow-sdk')
  const domain = await OrderSigningUtils.getDomain(chainId, {
    env: isBarnBackendEnv ? 'staging' : 'prod',
    settlementContractOverride: settlementContractOverride ?? COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS,
  })

  return _computeOrderUid(domain, order, owner)
}
