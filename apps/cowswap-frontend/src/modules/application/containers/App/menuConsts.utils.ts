import { getExplorerBaseUrl } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

export const getSolversExplorerUrl = (): string => `${getExplorerBaseUrl(SupportedChainId.MAINNET)}/solvers`
