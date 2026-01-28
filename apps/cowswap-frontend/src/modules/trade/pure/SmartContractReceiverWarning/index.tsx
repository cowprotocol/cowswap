import { ReactNode } from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Nullish } from '@cowprotocol/types'
import { BannerOrientation, InlineBanner, StatusColorVariant, UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { getNonEvmChainLabel } from 'common/chains/nonEvm'

const ConfirmCheckbox = styled.label`
  border: 0;
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  padding: 0;
  margin: 0;
  border-radius: 12px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s ease-in-out;
  background: transparent;
  color: var(${UI.COLOR_INFO_TEXT});

  &:hover {
    border-color: var(${UI.COLOR_INFO_TEXT});
  }

  input {
    accent-color: var(${UI.COLOR_INFO_TEXT});
    color: var(${UI.COLOR_INFO_TEXT});
  }
`

const StyledInlineBanner = styled(InlineBanner)`
  margin-top: -40px;
  padding-top: 47px;
`

interface SmartContractReceiverWarningProps {
  account: Nullish<string>
  recipient: Nullish<string>
  chainId: number
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
  const recipientAddress = recipient && recipient.trim().length > 0 ? recipient : account
  if (!recipientAddress) return null

  const isEvmChain = chainId in CHAIN_INFO
  const chainName = isEvmChain ? CHAIN_INFO[chainId as SupportedChainId].label : getNonEvmChainLabel(chainId) || 'this'
  return (
    <StyledInlineBanner
      bannerType={StatusColorVariant.Info}
      orientation={BannerOrientation.Horizontal}
      breakWord
      hideIcon={true}
    >
      <div>
        <ConfirmCheckbox>
          <input type="checkbox" checked={checked} onChange={(event) => toggle(event.target.checked)} />{' '}
          <Trans>I confirm this {chainName} address is correct.</Trans>
        </ConfirmCheckbox>
      </div>
    </StyledInlineBanner>
  )
}
