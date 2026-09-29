import { getProviderErrorMessage, isRejectRequestProviderError } from '@cowprotocol/common-utils'
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
    openErrorModal?.(getProviderErrorMessage(error) || t`Transaction failed`)

    return null
  }

  throw typeof error === 'string' ? new Error(error) : error
}
