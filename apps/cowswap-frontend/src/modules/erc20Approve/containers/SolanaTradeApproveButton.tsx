import { ReactNode } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { usePreventDoubleExecution } from '@cowprotocol/common-hooks'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'

import { useSolanaApproveCallback } from 'modules/trade'

import { LegacyApproveButton } from '../pure/LegacyApproveButton'
import { useIsPartialApproveSelectedByUser } from '../state'
import { ApprovalState } from '../types'

export interface SolanaTradeApproveButtonProps {
  amountToApprove: CurrencyAmount<Currency>
  isDisabled?: boolean
  approveClickEvent?: string
}

export function SolanaTradeApproveButton(approveParams: SolanaTradeApproveButtonProps): ReactNode {
  const { amountToApprove, isDisabled, approveClickEvent } = approveParams
  const token = amountToApprove.currency as TokenWithLogo
  const approve = useSolanaApproveCallback(token)

  const isPartialApproveSelectedByUser = useIsPartialApproveSelectedByUser()
  const partialApproveAmount = isPartialApproveSelectedByUser ? BigInt(amountToApprove.quotient.toString()) : undefined

  const { callback: onClick, isExecuting } = usePreventDoubleExecution(async () => {
    await approve?.(partialApproveAmount)
  })

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
