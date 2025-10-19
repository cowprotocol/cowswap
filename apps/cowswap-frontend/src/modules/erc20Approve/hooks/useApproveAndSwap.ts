import { useCallback } from 'react'

import { TransactionReceipt, TransactionResponse } from '@ethersproject/abstract-provider'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useApproveCurrency } from './useApproveCurrency'
import { useGeneratePermitInAdvanceToTrade } from './useGeneratePermitInAdvanceToTrade'

import { useTokenSupportsPermit } from '../../permit'
import { TradeType } from '../../trade'
import { MAX_APPROVE_AMOUNT } from '../constants'
import { useIsPartialApproveSelectedByUser, useUpdateApproveProgressModalState } from '../state'
import { getIsTradeApproveResult } from '../utils/getIsTradeApproveResult'

export interface ApproveAndSwapProps {
  amountToApprove: CurrencyAmount<Currency>
  onApproveConfirm?: (transactionHash?: string) => void
  ignorePermit?: boolean
  useModals?: boolean
}

export function useApproveAndSwap({
  amountToApprove,
  useModals,
  ignorePermit,
  onApproveConfirm,
}: ApproveAndSwapProps): () => Promise<void> {
  const isPartialApproveEnabledByUser = useIsPartialApproveSelectedByUser()
  const handleApprove = useApproveCurrency(amountToApprove, useModals)
  const updateTradeApproveState = useUpdateApproveProgressModalState()

  const isPermitSupported = useTokenSupportsPermit(amountToApprove.currency, TradeType.SWAP) && !ignorePermit
  const generatePermitToTrade = useGeneratePermitInAdvanceToTrade(amountToApprove)

  const handlePermit = useCallback(async () => {
    if (isPermitSupported && onApproveConfirm) {
      const isPermitSigned = await generatePermitToTrade()
      if (isPermitSigned) {
        onApproveConfirm()
      }

      return true
    }

    return false
  }, [isPermitSupported, onApproveConfirm, generatePermitToTrade])

  return useCallback(async (): Promise<void> => {
    const isPermitFlow = await handlePermit()

    if (isPermitFlow) {
      return
    }

    const amountToApproveBig = BigInt(amountToApprove.quotient.toString())
    const toApprove = isPartialApproveEnabledByUser ? amountToApproveBig : MAX_APPROVE_AMOUNT
    const tx = await handleApprove(toApprove)

    if (tx && onApproveConfirm) {
      if (getIsTradeApproveResult(tx)) {
        const approvedAmount = tx.approvedAmount
        const isApprovedAmountSufficient = Boolean(approvedAmount && approvedAmount >= amountToApproveBig)

        if (isApprovedAmountSufficient) {
          const hash =
            (tx.txResponse as TransactionReceipt).transactionHash || (tx.txResponse as TransactionResponse).hash

          onApproveConfirm(hash)
        } else {
          updateTradeApproveState({ error: 'Approved amount is not sufficient!' })
        }
      } else {
        onApproveConfirm(tx.transactionHash)
      }
    }
  }, [
    onApproveConfirm,
    isPartialApproveEnabledByUser,
    amountToApprove.quotient,
    handleApprove,
    updateTradeApproveState,
    handlePermit,
  ])
}
