import { ReactNode } from 'react'

import { BannerOrientation, InlineBanner, StatusColorVariant, UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { AFFILIATE_PAYOUTS_CHAIN_ID } from 'modules/affiliate/config/affiliateProgram.const'

import { AddressLink } from 'common/pure/AddressLink'

const Content = styled.div`
  display: flex;
  flex-direction: column;
`

const ConfirmCheckbox = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(${UI.COLOR_INFO_BG});
  cursor: pointer;
  padding: 14px;
  margin: 16px 0 0;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.2s ease-in-out;
  background: var(${UI.COLOR_INFO_BG});
  color: var(${UI.COLOR_INFO_TEXT});

  &:hover {
    border-color: var(${UI.COLOR_INFO_TEXT});
  }

  input {
    accent-color: var(${UI.COLOR_INFO_TEXT});
    color: var(${UI.COLOR_INFO_TEXT});
  }
`

interface PayoutAddressConfirmationProps {
  account: string
  checked: boolean
  onToggle(checked: boolean): void
}

export function PayoutAddressConfirmation(props: PayoutAddressConfirmationProps): ReactNode {
  const { account, checked, onToggle } = props

  return (
    <InlineBanner bannerType={StatusColorVariant.Info} orientation={BannerOrientation.Horizontal} breakWord>
      <Content>
        <div>
          <Trans>Rewards will be sent on Ethereum to</Trans>{' '}
          <AddressLink address={account} chainId={AFFILIATE_PAYOUTS_CHAIN_ID} />
        </div>
        <ConfirmCheckbox>
          <input type="checkbox" checked={checked} onChange={(event) => onToggle(event.target.checked)} />
          <Trans>I have access to this address on Ethereum.</Trans>
        </ConfirmCheckbox>
      </Content>
    </InlineBanner>
  )
}
