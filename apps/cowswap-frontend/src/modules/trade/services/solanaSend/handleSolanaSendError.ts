import {
  getProviderErrorMessage,
  isInsufficientFundsProviderError,
  isRejectRequestProviderError,
} from '@cowprotocol/common-utils'
import { Command } from '@cowprotocol/types'

import { t } from '@lingui/core/macro'

export interface HandleSolanaSendErrorParams {
  useModals: boolean | undefined
  /** Only used when `useModals` is true (the wrap/unwrap flow); modal-less callers own their own UI. */
  closeModals?: Command
  openErrorModal?: (message: string) => void
}

/**
 * Shared reject/error routing for Solana sends (wrap/unwrap and approve).
 */
export function handleSolanaSendError(
  error: unknown,
  { useModals, closeModals, openErrorModal }: HandleSolanaSendErrorParams,
): null {
  if (isRejectRequestProviderError(error)) {
    if (useModals) closeModals?.()

    return null
  }

  if (useModals) {
    openErrorModal?.(getSolanaSendErrorMessage(error))

    return null
  }

  throw typeof error === 'string' ? new Error(error) : error
}

function getSolanaSendErrorMessage(error: unknown): string {
  if (isInsufficientFundsProviderError(error)) {
    return t`You don't have enough SOL to cover the network fee and account rent. Reduce the amount or add more SOL to your wallet.`
  }

  return getProviderErrorMessage(error) || t`Transaction failed`
}
