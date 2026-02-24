import { getExplorerBaseUrl } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

export function getSolversExplorerUrl(): string {
  return `${getExplorerBaseUrl(SupportedChainId.MAINNET)}/solvers`
}
