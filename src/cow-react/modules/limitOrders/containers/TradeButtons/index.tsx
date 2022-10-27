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

export interface TradeButtonsProps {
  tradeContext: TradeFlowContext | null
  openConfirmScreen(): void
}

export function TradeButtons(props: TradeButtonsProps) {
  const { tradeContext, openConfirmScreen } = props
  const { expertMode } = useAtomValue(limitOrdersSettingsAtom)
  const formState = useLimitOrdersFormState()
  const tradeState = useLimitOrdersTradeState()
  const setConfirmationState = useSetAtom(limitOrdersConfirmState)

  const doTrade = useCallback(() => {
    if (expertMode && tradeContext) {
      setConfirmationState({ isPending: true, orderHash: null })
      tradeFlow(tradeContext)
    } else {
      openConfirmScreen()
    }
  }, [expertMode, tradeContext, openConfirmScreen, setConfirmationState])

  const button = limitOrdersTradeButtonsMap[formState]

  if (typeof button === 'function') {
    return button({ tradeState })
  }

  return (
    <SwapButton onClick={doTrade} disabled={button.disabled}>
      <Trans>{button.text}</Trans>
    </SwapButton>
  )
}
