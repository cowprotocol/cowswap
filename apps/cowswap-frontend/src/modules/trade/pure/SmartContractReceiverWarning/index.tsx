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
  font-weight: 600;
  align-items: baseline;
`

const ConfirmCheckbox = styled.label`
  display: block;
  border: 1px solid var(${UI.COLOR_ALERT_TEXT});
  cursor: pointer;
  padding: 10px;
  margin-top: 10px;
  border-radius: 8px;
  font-weight: 600;
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

  const ChainElement = (
    <ChainInfo>
      <NetworkLogo chainId={chainId} size={16} />
      <span>{chainName}</span>
      network
    </ChainInfo>
  )

  return (
    <InlineBanner bannerType={StatusColorVariant.Alert} orientation={BannerOrientation.Horizontal}>
      <div>
        The recipient address is <AddressLink address={recipient ?? account} chainId={chainId} /> on {ChainElement}.
        <br />
        Please make sure it is a correct one and already exists on {ChainElement}.
        <ConfirmCheckbox>
          <input type="checkbox" checked={isConfirmed} onChange={(event) => setIsConfirmed(event.target.checked)} />{' '}
          <Trans>Confirm</Trans>
        </ConfirmCheckbox>
      </div>
    </InlineBanner>
  )
}
