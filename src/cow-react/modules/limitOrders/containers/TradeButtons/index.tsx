import React, { useCallback } from 'react'
import { Trans } from '@lingui/macro'
import { useAtomValue } from 'jotai/utils'
import { useSetAtom } from 'jotai'
import { tradeFlow, TradeFlowContext } from '@cow/modules/limitOrders/services/tradeFlow'
import { limitOrdersSettingsAtom } from '@cow/modules/limitOrders/state/limitOrdersSettingsAtom'
import { useLimitOrdersTradeState } from '@cow/modules/limitOrders/hooks/useLimitOrdersTradeState'
import { useLimitOrdersFormState } from '../../hooks/useLimitOrdersFormState'
import { limitOrdersTradeButtonsMap, SwapButton } from './limitOrdersTradeButtonsMap'
import { limitOrdersConfirmState } from '../LimitOrdersConfirmModal/state'
import { useToggleWalletModal } from 'state/application/hooks'
import { limitOrdersQuoteAtom } from '@cow/modules/limitOrders/state/limitOrdersQuoteAtom'
import { useLimitOrdersWarningsAccepted } from '@cow/modules/limitOrders/hooks/useLimitOrdersWarningsAccepted'
import { PriceImpact } from 'hooks/usePriceImpact'

export interface TradeButtonsProps {
  tradeContext: TradeFlowContext | null
  priceImpact: PriceImpact
  openConfirmScreen(): void
}

export function TradeButtons(props: TradeButtonsProps) {
  const { tradeContext, openConfirmScreen, priceImpact } = props
  const { expertMode } = useAtomValue(limitOrdersSettingsAtom)
  const formState = useLimitOrdersFormState()
  const tradeState = useLimitOrdersTradeState()
  const setConfirmationState = useSetAtom(limitOrdersConfirmState)
  const toggleWalletModal = useToggleWalletModal()
  const quote = useAtomValue(limitOrdersQuoteAtom)
  const warningsAccepted = useLimitOrdersWarningsAccepted(false)

  const doTrade = useCallback(() => {
    if (expertMode && tradeContext) {
      const beforeTrade = () => setConfirmationState({ isPending: true, orderHash: null })

      tradeFlow(tradeContext, priceImpact, beforeTrade)
        .catch((error) => {
          console.error(error)
        })
        .finally(() => {
          setConfirmationState({ isPending: false, orderHash: null })
        })
    } else {
      openConfirmScreen()
    }
  }, [expertMode, tradeContext, openConfirmScreen, setConfirmationState, priceImpact])

  const button = limitOrdersTradeButtonsMap[formState]

  if (typeof button === 'function') {
    return button({ tradeState, toggleWalletModal, quote })
  }

  const isButtonDisabled = button.disabled || !warningsAccepted

  return (
    <SwapButton onClick={doTrade} disabled={isButtonDisabled}>
      <Trans>{button.text}</Trans>
    </SwapButton>
  )
}
