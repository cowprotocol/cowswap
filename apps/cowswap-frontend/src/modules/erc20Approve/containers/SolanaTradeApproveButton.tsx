import { ReactNode } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { usePreventDoubleExecution } from '@cowprotocol/common-hooks'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'

import { useSolanaApproveCallback } from 'modules/trade'

import { LegacyApproveButton } from '../pure/LegacyApproveButton'
import {
  useIsPartialApproveSelectedByUser,
  useResetApproveProgressModalState,
  useUpdateApproveProgressModalState,
} from '../state'
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

  const updateApproveState = useUpdateApproveProgressModalState()
  const resetApproveState = useResetApproveProgressModalState()

  const { callback: onClick, isExecuting } = usePreventDoubleExecution(async () => {
    updateApproveState({ currency: token, approveInProgress: true, amountToApprove })

    try {
      await approve?.(partialApproveAmount)
      resetApproveState()
    } catch (error) {
      updateApproveState({ approveInProgress: false, error: error instanceof Error ? error.message : String(error) })
    }
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
