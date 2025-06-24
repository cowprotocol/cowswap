import { ReactNode } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { useTheme } from '@cowprotocol/common-hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import styled from 'styled-components/macro'

const NetworkLogoWrapper = styled.div<{ size: number; margin?: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border-radius: 50%;
  overflow: hidden;
  margin: ${({ margin = '0' }) => margin};

  > img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`

export interface NetworkLogoProps {
  chainId: SupportedChainId
  size?: number
  margin?: string
  forceLightMode?: boolean
}

export function NetworkLogo({ chainId, size = 16, margin, forceLightMode }: NetworkLogoProps): ReactNode {
  const theme = useTheme()
  const chainInfo = getChainInfo(chainId)

  if (!chainInfo) return null

  let logoUrl: string

  // Special handling for Arbitrum to ensure visibility (same logic as useNetworkLogo)
  if (chainId === SupportedChainId.ARBITRUM_ONE) {
    logoUrl = chainInfo.logo.light
  } else {
    // Use light mode if forced, or based on theme preference
    const shouldUseLightLogo = forceLightMode || !theme.darkMode
    logoUrl = shouldUseLightLogo ? chainInfo.logo.light : chainInfo.logo.dark
  }

  return (
    <NetworkLogoWrapper size={size} margin={margin}>
      <img src={logoUrl} alt={`${chainInfo.label} network logo`} />
    </NetworkLogoWrapper>
  )
}
