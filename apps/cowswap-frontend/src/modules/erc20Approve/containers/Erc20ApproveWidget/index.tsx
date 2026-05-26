import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { isSellOrder } from '@cowprotocol/common-utils'

import { useIsInfiniteApproveDisabled } from 'modules/injectedWidget'
import { useDerivedTradeState } from 'modules/trade'

import { useSetUserApproveAmountModalState } from '../../state'
import { isPartialApproveEnabledAtom } from '../../state/isPartialApproveEnabledAtom'
import { isPartialApproveSelectedByUserAtom } from '../../state/isPartialApproveSelectedByUserAtom'

interface Erc20ApproveProps {
  isPartialApprovalEnabled: boolean
}

export function Erc20ApproveWidget({ isPartialApprovalEnabled }: Erc20ApproveProps): null {
  const setIsPartialApproveEnabled = useSetAtom(isPartialApproveEnabledAtom)
  const setIsPartialApproveSelectedByUser = useSetAtom(isPartialApproveSelectedByUserAtom)
  const isInfiniteApproveDisabled = useIsInfiniteApproveDisabled()
  const { inputCurrencyAmount, outputCurrencyAmount, orderKind } = useDerivedTradeState() || {}
  const setUserApproveAmountModalState = useSetUserApproveAmountModalState()

  const targetAmount =
    inputCurrencyAmount &&
    outputCurrencyAmount &&
    orderKind &&
    (isSellOrder(orderKind) ? inputCurrencyAmount : outputCurrencyAmount)
  const targetAmountRaw = targetAmount?.quotient.toString()

  // Reset custom amount every time sell/but amount changes
  useEffect(() => {
    setUserApproveAmountModalState({ amountSetByUser: undefined })
  }, [targetAmountRaw, setUserApproveAmountModalState])

  // Store isPartialApprovalEnabled to local state to avoid DIP breach (erc20Approve module should not depend on Swap).
  // When the widget integrator sets disableInfiniteApprove, partial approval is forced on regardless of settings.
  useEffect(() => {
    setIsPartialApproveEnabled(isPartialApprovalEnabled || isInfiniteApproveDisabled)
  }, [setIsPartialApproveEnabled, isPartialApprovalEnabled, isInfiniteApproveDisabled])

  // Same for the per-trade user selection: locked on while the widget integrator disables infinite approve.
  useEffect(() => {
    if (isInfiniteApproveDisabled) {
      setIsPartialApproveSelectedByUser(true)
    }
  }, [isInfiniteApproveDisabled, setIsPartialApproveSelectedByUser])

  return null
}
