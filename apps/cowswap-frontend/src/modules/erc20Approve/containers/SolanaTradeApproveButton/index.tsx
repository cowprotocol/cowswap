import { ReactNode } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { usePreventDoubleExecution } from '@cowprotocol/common-hooks'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'

import { useSolanaApproveCallback } from 'modules/trade'

import { LegacyApproveButton } from '../../pure/LegacyApproveButton'
import { ApprovalState } from '../../types'

export interface SolanaTradeApproveButtonProps {
  amountToApprove: CurrencyAmount<Currency>
  isDisabled?: boolean
  approveClickEvent?: string
}

/**
 * Solana counterpart to {@link TradeApproveButton}. Reuses the shared `LegacyApproveButton` visuals but
 * runs the SPL delegation approve (unlimited) instead of the EVM ERC20 approve — kept as a separate
 * component/hook so no Solana logic leaks into the EVM approve path.
 *
 * Solana approvals are always unlimited for now (partial can be added via the callback's amount
 * parameter later), so this mirrors the EVM "legacy" (non-partial) approve button.
 */
export function SolanaTradeApproveButton(props: SolanaTradeApproveButtonProps): ReactNode {
  const { amountToApprove, isDisabled, approveClickEvent } = props
  const token = amountToApprove.currency as TokenWithLogo
  const approve = useSolanaApproveCallback(token)

  const { callback: onClick, isExecuting } = usePreventDoubleExecution(async () => {
    await approve?.()
  })

  // The form only renders this while an approval is required, so it is never "approved" here; the state
  // is just pending (signing → confirmation) vs. ready to click.
  const state = isExecuting ? ApprovalState.PENDING : ApprovalState.NOT_APPROVED

  return (
    <LegacyApproveButton
      currency={token}
      state={state}
      isDisabled={isDisabled || !approve}
      onClick={onClick}
      clickEvent={approveClickEvent}
    />
  )
}
