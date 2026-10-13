import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { isSellOrder } from '@cowprotocol/common-utils'

import { useDerivedTradeState } from 'modules/trade'

import { useIsInfiniteApproveDisabled } from '../../hooks/useIsInfiniteApproveDisabled'
import { useSetUserApproveAmountModalState } from '../../state'
import { isPartialApproveEnabledAtom } from '../../state/isPartialApproveEnabledAtom'

interface Erc20ApproveProps {
  isPartialApprovalEnabled: boolean
}

export function Erc20ApproveWidget({ isPartialApprovalEnabled }: Erc20ApproveProps): null {
  const setIsPartialApproveEnabled = useSetAtom(isPartialApproveEnabledAtom)
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
  // Partial approval is forced on regardless of settings wherever infinite approve is unavailable.
  useEffect(() => {
    setIsPartialApproveEnabled(isPartialApprovalEnabled || isInfiniteApproveDisabled)
  }, [setIsPartialApproveEnabled, isPartialApprovalEnabled, isInfiniteApproveDisabled])

  return null
}
