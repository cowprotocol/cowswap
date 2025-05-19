import { getChainInfo } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { NetworkLogoWrapper } from './styled'

interface NetworkLogoProps {
  chainId: SupportedChainId
  size?: number
}

export function NetworkLogo({ chainId, size = 16 }: NetworkLogoProps) {
  const chainInfo = getChainInfo(chainId)
  if (!chainInfo) return null
  const logoUrl = chainInfo.logo.light

  return (
    <NetworkLogoWrapper size={size}>
      <img src={logoUrl} alt={`${chainInfo.label} network logo`} />
    </NetworkLogoWrapper>
  )
}
