import { ChainInfo, SupportedChainId } from '@cowprotocol/cow-sdk'
import { getChainAccentColors } from '@cowprotocol/ui'

import type { ChainAccentVars } from './styled'

export function getChainAccent(chainId: ChainInfo['id']): ChainAccentVars | undefined {
  const accentConfig = getChainAccentColors(chainId as SupportedChainId)
  if (!accentConfig) {
    return undefined
  }

  return {
    backgroundVar: accentConfig.bgVar,
    borderVar: accentConfig.borderVar,
    accentColorVar: accentConfig.accentVar,
  }
}
