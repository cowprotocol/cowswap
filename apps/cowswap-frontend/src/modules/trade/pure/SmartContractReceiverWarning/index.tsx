import { Dispatch, ReactNode, SetStateAction } from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Nullish } from '@cowprotocol/types'
import { UI, BannerOrientation, InlineBanner, NetworkLogo, StatusColorVariant } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { AddressLink } from 'common/pure/AddressLink'

const ChainInfo = styled.div`
  display: inline-flex;
  gap: 4px;
  align-items: center;
  margin: 0 0 8px;
`

const ChainLink = styled(AddressLink)`
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

interface SmartContractReceiverWarningProps {
  account: string
  recipient: Nullish<string>
  chainId: SupportedChainId
  state: [boolean, Dispatch<SetStateAction<boolean>>]
}

export function SmartContractReceiverWarning({
  state,
  account,
  recipient,
  chainId,
}: SmartContractReceiverWarningProps): ReactNode {
  const [isConfirmed, setIsConfirmed] = state
  const chainName = CHAIN_INFO[chainId].label

  return (
    <InlineBanner bannerType={StatusColorVariant.Alert} orientation={BannerOrientation.Horizontal} breakWord>
      <div>
        <ChainInfo>
          <Trans>Recipient</Trans>
          <NetworkLogo chainId={chainId} size={16} />
          <ChainLink address={recipient ?? account} chainId={chainId} />
          <span>is on {chainName} network.</span>
        </ChainInfo>
        <div>
          <Trans>Confirm this is the correct address and that it exists on this chain.</Trans>
        </div>
        <ConfirmCheckbox>
          <input type="checkbox" checked={isConfirmed} onChange={(event) => setIsConfirmed(event.target.checked)} />{' '}
          <Trans>Confirm</Trans>
        </ConfirmCheckbox>
      </div>
    </InlineBanner>
  )
}
