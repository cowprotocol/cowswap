import { ReactNode } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { PayoutAddressConfirmation } from './PayoutAddressConfirmation'

export interface CodeCreationPayoutSectionProps {
  account?: string
  chainId?: number
  payoutAddressConfirmed: boolean
  onTogglePayoutAddressConfirmed(checked: boolean): void
}

export function CodeCreationPayoutSection(props: CodeCreationPayoutSectionProps): ReactNode {
  const { account, chainId, payoutAddressConfirmed, onTogglePayoutAddressConfirmed } = props
  const showPayoutAddressConfirmation = !!account && chainId !== undefined && chainId !== SupportedChainId.MAINNET

  if (!showPayoutAddressConfirmation || !account) {
    return null
  }

  return (
    <PayoutAddressConfirmation
      account={account}
      checked={payoutAddressConfirmed}
      onToggle={onTogglePayoutAddressConfirmed}
    />
  )
}
