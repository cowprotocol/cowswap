import { ReactNode } from 'react'

import { PayoutAddressConfirmation } from './PayoutAddressConfirmation'

import { isSupportedPayoutsNetwork } from '../../../affiliate/lib/affiliateProgramUtils'

export interface CodeCreationPayoutSectionProps {
  account?: string
  chainId?: number
  payoutAddressConfirmed: boolean
  onTogglePayoutAddressConfirmed(checked: boolean): void
}

export function CodeCreationPayoutSection(props: CodeCreationPayoutSectionProps): ReactNode {
  const { account, chainId, payoutAddressConfirmed, onTogglePayoutAddressConfirmed } = props
  const showPayoutAddressConfirmation = !!account && !!chainId && !isSupportedPayoutsNetwork(chainId)

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
