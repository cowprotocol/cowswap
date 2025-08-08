import React, { ReactNode } from 'react'

import { DISCORD_LINK } from '@cowprotocol/common-const'
import { ExternalLink, InlineBanner, StatusColorVariant } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import styled from 'styled-components/macro'

import { useCurrentAccountProxy } from '../../hooks/useCurrentAccountProxy'

const Wrapper = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100vh;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  text-align: center;
`

export function InvalidCoWShedSetup(): ReactNode {
  const { chainId } = useWalletInfo()
  const proxyInfo = useCurrentAccountProxy()?.data
  const isProxySetupValid = proxyInfo?.isProxySetupValid

  if (isProxySetupValid !== false || proxyInfo?.chainId !== chainId) return null

  console.debug('[CoWShed validation] proxyInfo', proxyInfo)

  return (
    <Wrapper>
      <InlineBanner bannerType={StatusColorVariant.Danger}>
        <div>
          <div>CoW Shed setup is invalid!</div>
          <div>
            <ExternalLink href={DISCORD_LINK}>Please contact CoW Swap support!</ExternalLink>
          </div>
        </div>
      </InlineBanner>
    </Wrapper>
  )
}
