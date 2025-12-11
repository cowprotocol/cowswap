import { ReactNode } from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Nullish } from '@cowprotocol/types'
import { UI, BannerOrientation, InlineBanner, NetworkLogo, StatusColorVariant } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { AddressLink } from 'common/pure/AddressLink'

const ChainLink = styled(AddressLink)`
  margin: 0 6px;

  && {
    color: var(${UI.COLOR_TEXT});
    text-decoration-color: var(${UI.COLOR_TEXT});
  }

  &&:visited,
  &&:hover,
  &&:active {
    color: var(${UI.COLOR_TEXT});
    text-decoration-color: var(${UI.COLOR_TEXT});
  }
`

const ConfirmCheckbox = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(${UI.COLOR_ALERT_BG});
  cursor: pointer;
  padding: 14px;
  margin: 16px 0 0;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.2s ease-in-out;
  background: var(${UI.COLOR_ALERT_BG});
  color: var(${UI.COLOR_ALERT_TEXT});

  &:hover {
    border-color: var(${UI.COLOR_ALERT_TEXT});
  }

  input {
    accent-color: var(${UI.COLOR_ALERT_TEXT});
    color: var(${UI.COLOR_ALERT_TEXT});
  }
`

const NetworkLogoStyled = styled(NetworkLogo)`
  margin-left: 6px;
  top: 3px;
  position: relative;
`

interface SmartContractReceiverWarningProps {
  account: string
  recipient: Nullish<string>
  chainId: SupportedChainId
  checked: boolean
  toggle(state: boolean): void
}

export function SmartContractReceiverWarning({
  checked,
  toggle,
  account,
  recipient,
  chainId,
}: SmartContractReceiverWarningProps): ReactNode {
  const chainName = CHAIN_INFO[chainId].label

  return (
    <InlineBanner bannerType={StatusColorVariant.Alert} orientation={BannerOrientation.Horizontal} breakWord>
      <div>
        <div>
          <Trans>Recipient</Trans>
          <NetworkLogoStyled chainId={chainId} size={16} />
          <ChainLink address={recipient ?? account} chainId={chainId} />
          <span>is on {chainName} network.</span>
        </div>
        <div>
          <Trans>Confirm this is the correct address and that it exists on this chain.</Trans>
        </div>
        <ConfirmCheckbox>
          <input type="checkbox" checked={checked} onChange={(event) => toggle(event.target.checked)} />{' '}
          <Trans>Confirm</Trans>
        </ConfirmCheckbox>
      </div>
    </InlineBanner>
  )
}
