/* eslint-disable complexity */
import { useMemo } from 'react'

import { getChainType, getNonEvmChainLabel } from 'common/chains/nonEvm'
import { validateRecipientForChain } from 'common/recipient/nonEvmRecipientValidation'

import { useDerivedTradeState } from './useDerivedTradeState'
import { useTradeState } from './useTradeState'

export interface RecipientRequirementState {
  destinationChainId: number | undefined
  destinationChainType: ReturnType<typeof getChainType>
  isRecipientRequired: boolean
  isRecipientBlocked: boolean
  isRecipientValid: boolean
  isRecipientMissing: boolean
  recipientError: string | undefined
  blockedQuoteMessage: string | undefined
  toggleDisabled: boolean
  toggleDisabledReason: string | undefined
  warningText: string | undefined
  recipient: string
  isMismatch: boolean
}

export function useRecipientRequirement(): RecipientRequirementState {
  const { state } = useTradeState()
  const derivedState = useDerivedTradeState()

  const recipient = state?.recipient?.trim() ?? ''
  const destinationChainId =
    state?.targetChainId ?? derivedState?.outputCurrency?.chainId ?? state?.chainId ?? undefined
  const destinationChainType = getChainType(destinationChainId)

  return useMemo(() => {
    const isRecipientRequired = destinationChainType !== 'evm'

    if (!isRecipientRequired) {
      return {
        destinationChainId,
        destinationChainType,
        isRecipientRequired: false,
        isRecipientBlocked: false,
        isRecipientValid: true,
        isRecipientMissing: false,
        recipientError: undefined,
        blockedQuoteMessage: undefined,
        toggleDisabled: false,
        toggleDisabledReason: undefined,
        warningText: undefined,
        recipient,
        isMismatch: false,
      }
    }

    const chainLabel = destinationChainId != null ? getNonEvmChainLabel(destinationChainId) : undefined
    const recipientRequiredReason = chainLabel
      ? `Recipient required for ${chainLabel}`
      : 'Recipient required for Bitcoin/Solana'
    const isRecipientMissing = recipient.length === 0
    const validation = isRecipientMissing ? { isValid: true } : validateRecipientForChain(destinationChainId, recipient)
    const isRecipientValid = isRecipientMissing || validation.isValid
    const isRecipientBlocked = !isRecipientMissing && !validation.isValid
    const recipientError = !isRecipientMissing && !validation.isValid ? validation.reason : undefined

    return {
      destinationChainId,
      destinationChainType,
      isRecipientRequired: true,
      isRecipientBlocked,
      isRecipientValid,
      isRecipientMissing,
      recipientError,
      blockedQuoteMessage: undefined,
      toggleDisabled: true,
      toggleDisabledReason: recipientRequiredReason,
      warningText: undefined,
      recipient,
      isMismatch: !isRecipientMissing && Boolean(validation.isMismatch),
    }
  }, [destinationChainId, destinationChainType, recipient])
}
