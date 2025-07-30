import { useMemo } from 'react'

import { isAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

export interface UseRecipientValidationParams {
  recipient?: string | null
  recipientEnsName?: string | null
  recipientChainId?: number
  account?: string | null
  isFeeDetailsOpen?: boolean
  fallbackChainId?: SupportedChainId
}

export interface RecipientRowProps {
  chainId: SupportedChainId
  recipient: string
  recipientEnsName?: string | null
  recipientChainId?: number
  showNetworkLogo: boolean
}

export enum RecipientValidationError {
  FEE_DETAILS_OPEN = 'fee-details-open',
  SAME_AS_ACCOUNT = 'same-as-account', 
  INVALID_ADDRESS = 'invalid-address',
  ENS_NOT_SUPPORTED = 'ens-not-supported',
  MISSING_DATA = 'missing-data',
}

export type RecipientValidationResult = 
  | { isValid: false; reason: RecipientValidationError }
  | { isValid: true; props: RecipientRowProps }

function isValidRecipientContext(params: {
  recipient?: string | null
  account?: string | null
  isFeeDetailsOpen?: boolean
}): params is {
  recipient: string
  account: string
  isFeeDetailsOpen: boolean
} {
  return Boolean(params.recipient) && Boolean(params.account) && !params.isFeeDetailsOpen
}

function isValidForBridge(recipient: string, recipientEnsName?: string | null): boolean {
  return isAddress(recipient) && !recipientEnsName
}

function isValidForSwap(recipient: string, recipientEnsName?: string | null, chainId: SupportedChainId): boolean {
  return isAddress(recipient) || (Boolean(recipientEnsName) && chainId === SupportedChainId.MAINNET)
}

function isDifferentFromAccount(
  recipient: string,
  recipientEnsName: string | null | undefined,
  account: string,
): boolean {
  const resolvedAddress = recipientEnsName || recipient
  return resolvedAddress?.toLowerCase() !== account.toLowerCase()
}

function resolveDisplayChainId(
  recipientChainId: number | undefined,
  fallbackChainId: SupportedChainId | undefined,
  currentChainId: SupportedChainId,
): SupportedChainId {
  if (recipientChainId && Object.values(SupportedChainId).includes(recipientChainId as SupportedChainId)) {
    return recipientChainId as SupportedChainId
  }
  return fallbackChainId || currentChainId
}

function validateContextAndReturnError(
  recipient: string | null | undefined,
  account: string | null | undefined,
  isFeeDetailsOpen: boolean,
): { isValid: false; reason: RecipientValidationError.MISSING_DATA | RecipientValidationError.FEE_DETAILS_OPEN } | null {
  if (!recipient || !account) {
    return { isValid: false, reason: RecipientValidationError.MISSING_DATA }
  }
  if (isFeeDetailsOpen) {
    return { isValid: false, reason: RecipientValidationError.FEE_DETAILS_OPEN }
  }
  return null
}

export function useRecipientValidation({
  recipient,
  recipientEnsName,
  recipientChainId,
  account,
  isFeeDetailsOpen = false,
  fallbackChainId,
}: UseRecipientValidationParams): RecipientValidationResult {
  const { chainId } = useWalletInfo()

  return useMemo(() => {
    const context = { recipient, account, isFeeDetailsOpen }
    if (!isValidRecipientContext(context)) {
      const error = validateContextAndReturnError(recipient, account, isFeeDetailsOpen)
      return error || { isValid: false, reason: RecipientValidationError.MISSING_DATA }
    }

    if (!isDifferentFromAccount(context.recipient, recipientEnsName, context.account)) {
      return { isValid: false, reason: RecipientValidationError.SAME_AS_ACCOUNT }
    }

    const isBridgeTransaction = recipientChainId && recipientChainId !== chainId
    const isValid = isBridgeTransaction
      ? isValidForBridge(context.recipient, recipientEnsName)
      : isValidForSwap(context.recipient, recipientEnsName, chainId)

    if (!isValid) {
      if (isBridgeTransaction && recipientEnsName) {
        return { isValid: false, reason: RecipientValidationError.ENS_NOT_SUPPORTED }
      }
      return { isValid: false, reason: RecipientValidationError.INVALID_ADDRESS }
    }

    const displayChainId = resolveDisplayChainId(recipientChainId, fallbackChainId, chainId)

    return {
      isValid: true,
      props: {
        chainId: displayChainId,
        recipient: context.recipient,
        recipientEnsName,
        recipientChainId,
        showNetworkLogo: Boolean(recipientChainId && recipientChainId !== chainId),
      },
    }
  }, [recipient, recipientEnsName, recipientChainId, account, isFeeDetailsOpen, fallbackChainId, chainId])
}