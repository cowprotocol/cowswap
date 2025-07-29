import { useMemo, ReactNode, createElement } from 'react'

import { isAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { RecipientRow } from 'modules/trade'

interface UseRecipientDisplayParams {
  recipient?: string | null
  recipientEnsName?: string | null
  recipientChainId?: number
  account?: string | null
  isFeeDetailsOpen?: boolean // Made optional for cases where we always want to show
  fallbackChainId?: SupportedChainId // For cases where we need to specify fallback chain
}

/**
 * Validates recipient for bridge transactions
 * Bridge transactions only allow valid addresses, no ENS names
 */
function isValidBridgeRecipient(recipient: string): boolean {
  return Boolean(isAddress(recipient))
}

/**
 * Validates recipient for regular swap transactions
 * Regular swaps allow valid addresses OR ENS names (.eth domains)
 */
function isValidSwapRecipient(recipient: string, recipientEnsName?: string | null): boolean {
  return Boolean(recipientEnsName || isAddress(recipient) || recipient.endsWith('.eth'))
}

/**
 * Determines whether the recipient row should be displayed
 * Checks for valid data and accordion state
 */
function shouldShowRecipient(
  recipient: string | null | undefined,
  account: string | null | undefined,
  isFeeDetailsOpen: boolean
): boolean {
  if (!recipient || !account) return false
  if (isFeeDetailsOpen) return false
  return true
}

/**
 * Validates recipient based on transaction type (bridge vs swap)
 */
function isValidRecipient(
  recipient: string,
  recipientEnsName: string | null | undefined,
  isBridgeTransaction: boolean
): boolean {
  if (isBridgeTransaction) {
    return isValidBridgeRecipient(recipient)
  }
  return isValidSwapRecipient(recipient, recipientEnsName)
}

/**
 * Checks if recipient differs from current account
 */
function isDifferentFromAccount(
  recipient: string,
  recipientEnsName: string | null | undefined,
  account: string
): boolean {
  const resolvedAddress = recipientEnsName || recipient
  return resolvedAddress?.toLowerCase() !== account.toLowerCase()
}

/**
 * Custom hook to handle recipient display logic for trade details
 * Shows recipient row when accordion is collapsed and recipient is valid
 */
export function useRecipientDisplay({
  recipient,
  recipientEnsName,
  recipientChainId,
  account,
  isFeeDetailsOpen = false, // Default to false (always show) for backwards compatibility
  fallbackChainId,
}: UseRecipientDisplayParams): ReactNode {
  const { chainId } = useWalletInfo()

  return useMemo(() => {
    if (!shouldShowRecipient(recipient, account, isFeeDetailsOpen)) {
      return null
    }
    
    // After shouldShowRecipient check, we know recipient and account are non-null strings
    const validatedRecipient = recipient as string
    const validatedAccount = account as string
    
    const isBridgeTransaction = recipientChainId && recipientChainId !== chainId
    
    if (!isValidRecipient(validatedRecipient, recipientEnsName, Boolean(isBridgeTransaction))) {
      return null
    }
    
    if (!isDifferentFromAccount(validatedRecipient, recipientEnsName, validatedAccount)) {
      return null
    }
    
    const displayChainId = (recipientChainId || fallbackChainId || chainId) as SupportedChainId
    
    return createElement(RecipientRow, {
      chainId: displayChainId,
      recipient: validatedRecipient,
      account: validatedAccount,
      recipientEnsName: recipientEnsName,
      recipientChainId: recipientChainId,
      showNetworkLogo: Boolean(recipientChainId && recipientChainId !== chainId),
    })
  }, [isFeeDetailsOpen, recipient, account, recipientChainId, recipientEnsName, chainId, fallbackChainId])
}