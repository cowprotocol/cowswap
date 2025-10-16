import { useCallback } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useApproveCurrency } from './useApproveCurrency'
import { useGeneratePermitInAdvanceToTrade } from './useGeneratePermitInAdvanceToTrade'

import { useTokenSupportsPermit } from '../../permit'
import { TradeType } from '../../trade'
import { MAX_APPROVE_AMOUNT } from '../constants'
import { useIsPartialApproveSelectedByUser } from '../state'
import { getIsTradeApproveResult } from '../utils/getIsTradeApproveResult'

export interface ApproveAndSwapProps {
  amountToApprove: CurrencyAmount<Currency>
  confirmSwap?: () => void
  ignorePermit?: boolean
  useModals?: boolean
}

export function useApproveAndSwap({
  amountToApprove,
  useModals,
  ignorePermit,
  confirmSwap,
}: ApproveAndSwapProps): () => Promise<void> {
  const isPartialApproveEnabledByUser = useIsPartialApproveSelectedByUser()
  const handleApprove = useApproveCurrency(amountToApprove, useModals)

  const isPermitSupported = useTokenSupportsPermit(amountToApprove.currency, TradeType.SWAP) && !ignorePermit
  const generatePermitToTrade = useGeneratePermitInAdvanceToTrade(amountToApprove)

  return useCallback(async (): Promise<void> => {
    if (isPermitSupported && confirmSwap) {
      const isPermitSigned = await generatePermitToTrade()
      if (isPermitSigned) {
        confirmSwap()
      }

      return
    }

    const amountToApproveBig = BigInt(amountToApprove.quotient.toString())
    const toApprove = isPartialApproveEnabledByUser ? amountToApproveBig : MAX_APPROVE_AMOUNT
    const tx = await handleApprove(toApprove)

    if (tx && confirmSwap) {
      if (getIsTradeApproveResult(tx)) {
        const approvedAmount = tx.approvedAmount
        const isApprovedAmountSufficient = Boolean(approvedAmount && approvedAmount >= amountToApproveBig)

        if (isApprovedAmountSufficient) {
          confirmSwap()
        } else {
          throw new Error('Approved amount is not sufficient!')
        }
      } else {
        confirmSwap()
      }
    }
  }, [
    isPermitSupported,
    confirmSwap,
    isPartialApproveEnabledByUser,
    amountToApprove.quotient,
    handleApprove,
    generatePermitToTrade,
  ])
}
