import React, { ReactNode } from 'react'

import { DISCORD_LINK } from '@cowprotocol/common-const'
import { ExternalLink, InlineBanner, StatusColorVariant } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Trans } from '@lingui/react/macro'
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

  console.debug('[CoWShed validation] InvalidCoWShedSetup', proxyInfo)

  return (
    <Wrapper>
      <InlineBanner bannerType={StatusColorVariant.Danger}>
        <div>
          <div>
            <Trans>CoW Shed setup is invalid!</Trans>
          </div>
          <div>
            <ExternalLink href={DISCORD_LINK}>
              <Trans>Please contact CoW Swap support!</Trans>
            </ExternalLink>
          </div>
        </div>
      </InlineBanner>
    </Wrapper>
  )
}
