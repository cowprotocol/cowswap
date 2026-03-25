import { useCallback } from 'react'

import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { Nullish } from '@cowprotocol/types'
import type { SafeMultisigTransactionResponse } from '@safe-global/types-kit'

import { useLingui } from '@lingui/react/macro'

import { useApproveCurrency } from './useApproveCurrency'
import { useGeneratePermitInAdvanceToTrade } from './useGeneratePermitInAdvanceToTrade'

import { useTokenSupportsPermit } from '../../permit'
import { TradeType } from '../../trade'
import { MAX_APPROVE_AMOUNT } from '../constants'
import { useIsPartialApproveSelectedByUser, useUpdateApproveProgressModalState } from '../state'
import { getIsTradeApproveResult } from '../utils/getIsTradeApproveResult'

import type { GenerecTradeApproveResult } from '../containers'

function confirmTradeApproveResult(
  tx: GenerecTradeApproveResult | SafeMultisigTransactionResponse,
  amountToApproveBig: bigint,
  minAmountToSignForSwap: CurrencyAmount<Currency> | undefined,
  onApproveConfirm: (transactionHash: string | null) => void,
  updateTradeApproveState: (state: { error: string }) => void,
  approvedAmountInsufficientLabel: string,
): void {
  if (getIsTradeApproveResult(tx)) {
    const approvedAmount = tx.approvedAmount
    const minAmountToSignForSwapBig = minAmountToSignForSwap
      ? BigInt(minAmountToSignForSwap.quotient.toString())
      : amountToApproveBig
    const isApprovedAmountSufficient = Boolean(approvedAmount && approvedAmount >= minAmountToSignForSwapBig)

    if (isApprovedAmountSufficient) {
      const hash = 'transactionHash' in tx.txResponse ? tx.txResponse.transactionHash : tx.txResponse.hash

      onApproveConfirm(hash)
    } else {
      updateTradeApproveState({ error: approvedAmountInsufficientLabel })
    }
  } else {
    onApproveConfirm(tx.transactionHash)
  }
}

export interface ApproveAndSwapProps {
  amountToApprove: CurrencyAmount<Currency>
  minAmountToSignForSwap?: CurrencyAmount<Currency>
  onApproveConfirm?: (transactionHash: string | null) => void
  ignorePermit?: boolean
  useModals?: boolean
}

export function useApproveAndSwap({
  amountToApprove,
  useModals,
  ignorePermit,
  onApproveConfirm,
  minAmountToSignForSwap,
}: ApproveAndSwapProps): () => Promise<void> {
  const { t } = useLingui()
  const isPartialApproveEnabledByUser = useIsPartialApproveSelectedByUser()
  const handleApprove = useApproveCurrency(amountToApprove, useModals)
  const updateTradeApproveState = useUpdateApproveProgressModalState()

  const isPermitSupported = useTokenSupportsPermit(amountToApprove.currency, TradeType.SWAP) && !ignorePermit
  const generatePermitToTrade = useGeneratePermitInAdvanceToTrade(amountToApprove)

  const handlePermit = useCallback(async (): Promise<boolean> => {
    if (!isPermitSupported || !onApproveConfirm) {
      return false
    }
    const isPermitSigned = await generatePermitToTrade()
    if (!isPermitSigned) {
      return false
    }
    onApproveConfirm(null)
    return true
  }, [isPermitSupported, onApproveConfirm, generatePermitToTrade])

  return useCallback(async (): Promise<void> => {
    try {
      const permitHandled = await handlePermit()

      if (permitHandled) {
        return
      }
    } catch {
      return
    }

    const amountToApproveBig = BigInt(amountToApprove.quotient.toString())
    const toApprove = isPartialApproveEnabledByUser ? amountToApproveBig : MAX_APPROVE_AMOUNT
    const tx: Nullish<GenerecTradeApproveResult | SafeMultisigTransactionResponse> = await handleApprove(toApprove)

    if (tx && onApproveConfirm) {
      confirmTradeApproveResult(
        tx,
        amountToApproveBig,
        minAmountToSignForSwap,
        onApproveConfirm,
        updateTradeApproveState,
        t`Approved amount is not sufficient!`,
      )
    }
  }, [
    handlePermit,
    amountToApprove.quotient,
    isPartialApproveEnabledByUser,
    handleApprove,
    onApproveConfirm,
    updateTradeApproveState,
    minAmountToSignForSwap,
    t,
  ])
}
