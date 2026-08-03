import { getProviderErrorMessage, isRejectRequestProviderError } from '@cowprotocol/common-utils'
import { Command } from '@cowprotocol/types'

import { t } from '@lingui/core/macro'

export interface HandleSolanaSendErrorParams {
  useModals: boolean | undefined
  closeModals: Command
  openErrorModal: (message: string) => void
}

/**
 * Shared reject/error routing for Solana sends (wrap/unwrap and approve).
 *
 * A rejection is the user's choice, not a failure: close the pending modal and return `null`. Any other
 * error is shown in place of the pending screen (modal transitions pending → error), or rethrown when
 * the caller opted out of modals. Callers add their own logging/analytics around this.
 */
export function handleSolanaSendError(
  error: unknown,
  { useModals, closeModals, openErrorModal }: HandleSolanaSendErrorParams,
): null {
  if (isRejectRequestProviderError(error)) {
    useModals && closeModals()

    return null
  }

  if (useModals) {
    openErrorModal(getProviderErrorMessage(error) || t`Transaction failed`)

    return null
  }

  throw typeof error === 'string' ? new Error(error) : error
}
