import { useMemo, ReactNode, createElement } from 'react'

import { isAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { RecipientRow } from 'modules/trade'

export interface UseRecipientDisplayParams {
  recipient?: string | null
  recipientEnsName?: string | null
  recipientChainId?: number
  account?: string | null
  isFeeDetailsOpen?: boolean
  fallbackChainId?: SupportedChainId
}

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

export function useRecipientDisplay({
  recipient,
  recipientEnsName,
  recipientChainId,
  account,
  isFeeDetailsOpen = false,
  fallbackChainId,
}: UseRecipientDisplayParams): ReactNode {
  const { chainId } = useWalletInfo()

  return useMemo(() => {
    const context = { recipient, account, isFeeDetailsOpen }
    if (!isValidRecipientContext(context)) {
      return null
    }

    if (!isDifferentFromAccount(context.recipient, recipientEnsName, context.account)) {
      return null
    }

    const isBridgeTransaction = recipientChainId && recipientChainId !== chainId
    const isValid = isBridgeTransaction
      ? isValidForBridge(context.recipient, recipientEnsName)
      : isValidForSwap(context.recipient, recipientEnsName, chainId)

    if (!isValid) {
      return null
    }

    const displayChainId = resolveDisplayChainId(recipientChainId, fallbackChainId, chainId)

    return createElement(RecipientRow, {
      chainId: displayChainId,
      recipient: context.recipient,
      account: context.account,
      recipientEnsName,
      recipientChainId,
      showNetworkLogo: Boolean(recipientChainId && recipientChainId !== chainId),
    })
  }, [recipient, recipientEnsName, recipientChainId, account, isFeeDetailsOpen, fallbackChainId, chainId])
}
