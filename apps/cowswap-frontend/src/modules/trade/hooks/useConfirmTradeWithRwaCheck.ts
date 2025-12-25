import { useCallback, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'

import { RwaTokenStatus, useRwaConsentModalState, useRwaTokenStatus, RwaTokenInfo } from 'modules/rwa'

import { useDerivedTradeState } from './useDerivedTradeState'
import { TradeConfirmActions, useTradeConfirmActions } from './useTradeConfirmActions'

export interface ConfirmTradeWithRwaCheckResult {
  confirmTrade: (forcePriceConfirmation?: boolean) => void
  rwaStatus: RwaTokenStatus
  rwaTokenInfo: RwaTokenInfo | null
  tradeConfirmActions: TradeConfirmActions
}

export interface UseConfirmTradeWithRwaCheckParams {
  /**
   * Optional callback that's called when the trade confirmation is actually opened
   * (not when the consent modal is shown).
   * Use this for analytics or other side effects that should only happen on actual confirmation.
   */
  onConfirmOpen?: () => void
}

/**
 * Hook that wraps trade confirmation with RWA token consent check.
 *
 * If the user's country is unknown and they haven't given consent for a restricted token,
 * this will open the RWA consent modal instead of the trade confirmation modal.
 * After consent is given, the trade confirmation will proceed.
 *
 * Use this hook in all trade flows (swap, limit orders, TWAP) to ensure consistent
 */
export function useConfirmTradeWithRwaCheck(
  params: UseConfirmTradeWithRwaCheckParams = {},
): ConfirmTradeWithRwaCheckResult {
  const { onConfirmOpen } = params

  const derivedState = useDerivedTradeState()
  const { inputCurrency, outputCurrency } = derivedState || {}

  const { status: rwaStatus, rwaTokenInfo } = useRwaTokenStatus({
    inputCurrency,
    outputCurrency,
  })
  const { openModal: openRwaConsentModal } = useRwaConsentModalState()
  const tradeConfirmActions = useTradeConfirmActions()

  const confirmTrade = useCallback(
    (forcePriceConfirmation?: boolean) => {
      // Show consent modal if country unknown and consent not given
      if (rwaStatus === RwaTokenStatus.RequiredConsent && rwaTokenInfo) {
        openRwaConsentModal({
          consentHash: rwaTokenInfo.consentHash,
          token: TokenWithLogo.fromToken(rwaTokenInfo.token),
        })
        return
      }

      onConfirmOpen?.()
      tradeConfirmActions.onOpen(forcePriceConfirmation)
    },
    [rwaStatus, rwaTokenInfo, openRwaConsentModal, tradeConfirmActions, onConfirmOpen],
  )

  return useMemo(
    () => ({
      confirmTrade,
      rwaStatus,
      rwaTokenInfo,
      tradeConfirmActions,
    }),
    [confirmTrade, rwaStatus, rwaTokenInfo, tradeConfirmActions],
  )
}
