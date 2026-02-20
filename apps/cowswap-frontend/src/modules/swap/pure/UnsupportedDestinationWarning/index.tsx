import { ReactNode } from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { BannerOrientation, InlineBanner, NetworkLogo, StatusColorVariant } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

const NetworkLogoStyled = styled(NetworkLogo)`
  margin: 0 4px;
  top: 3px;
  position: relative;
`

const EnableRecipientLink = styled.button`
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  text-decoration: underline;
  cursor: pointer;
  color: inherit;
`

interface UnsupportedDestinationWarningProps {
  destinationChainId: SupportedChainId
  onEnableCustomRecipient: () => void
}

export function UnsupportedDestinationWarning({
  destinationChainId,
  onEnableCustomRecipient,
}: UnsupportedDestinationWarningProps): ReactNode {
  const chainName = CHAIN_INFO[destinationChainId]?.label ?? 'this chain'

  return (
    <InlineBanner bannerType={StatusColorVariant.Alert} orientation={BannerOrientation.Horizontal} breakWord>
      <div>
        <div>
          <Trans>
            Your smart wallet doesn&apos;t exist on
            <NetworkLogoStyled chainId={destinationChainId} size={16} />
            {chainName}. Bridged funds sent to your address on this chain would be lost.
          </Trans>
        </div>
        <div>
          <EnableRecipientLink type="button" onClick={onEnableCustomRecipient}>
            <Trans>Send to a different address instead</Trans>
          </EnableRecipientLink>
        </div>
      </div>
    </InlineBanner>
  )
}
