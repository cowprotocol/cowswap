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
  className?: string
  size?: number
  margin?: string
  logoUrl?: string
}

export function NetworkLogo({
  chainId,
  size = 16,
  margin,
  className,
  logoUrl: defaultLogoUrl,
}: NetworkLogoProps): ReactNode {
  const theme = useTheme()
  const chainInfo = getChainInfo(chainId)

  if (!chainInfo && !defaultLogoUrl) return null

  let logoUrl: string | undefined = defaultLogoUrl

  if (!logoUrl && chainInfo) {
    logoUrl = theme.darkMode ? chainInfo.logo.dark : chainInfo.logo.light
  }

  return (
    <NetworkLogoWrapper size={size} margin={margin} className={className}>
      <img src={logoUrl} alt={`${chainInfo?.label} network logo`} />
    </NetworkLogoWrapper>
  )
}
