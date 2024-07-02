import { COWSWAP_ETHFLOW_CONTRACT_ADDRESS } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { isEns, isProd, isStaging } from './environments'

export function getEthFlowContractAddress(chainId: SupportedChainId): string {
  const contractEnv = isProd || isStaging || isEns ? 'prod' : 'barn'

  return COWSWAP_ETHFLOW_CONTRACT_ADDRESS[contractEnv][chainId]
}
