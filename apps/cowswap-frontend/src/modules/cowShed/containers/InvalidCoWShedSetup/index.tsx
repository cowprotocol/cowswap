import React, { ReactNode } from 'react'

import { DISCORD_LINK } from '@cowprotocol/common-const'
import { ExternalLink, InlineBanner, StatusColorVariant } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { useCurrentAccountProxyAddress } from '../../hooks/useCurrentAccountProxyAddress'

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
  const proxyInfo = useCurrentAccountProxyAddress()
  const isProxySetupValid = proxyInfo?.isProxySetupValid

  if (isProxySetupValid !== false) return null

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
