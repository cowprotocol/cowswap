import React from 'react'

import { UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import styled from 'styled-components/macro'

import { useIsNoImpactWarningAccepted, useTradeConfirmActions } from 'modules/trade'
import {
  TradeFormBlankButton,
  TradeFormButtons,
  useGetTradeFormValidation,
  useTradeFormButtonContext,
} from 'modules/tradeFormValidation'
import { useHighFeeWarning } from 'modules/tradeWidgetAddons'

import { yieldTradeButtonsMap } from './yieldTradeButtonsMap'

import { useYieldFormState } from '../../hooks/useYieldFormState'

const StyledTradeFormButtons = styled((props) => <TradeFormButtons {...props} />)<{ active: boolean }>`
  background: ${({ active }) => (active ? `var(${UI.COLOR_COWAMM_DARK_GREEN})` : null)};
  color: ${({ active }) => (active ? `var(${UI.COLOR_COWAMM_LIGHT_GREEN})` : null)};
`

interface TradeButtonsProps {
  isTradeContextReady: boolean
  isOutputLpToken: boolean
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function TradeButtons({ isTradeContextReady, isOutputLpToken }: TradeButtonsProps) {
  const primaryFormValidation = useGetTradeFormValidation()
  const tradeConfirmActions = useTradeConfirmActions()
  const { feeWarningAccepted } = useHighFeeWarning()
  const isNoImpactWarningAccepted = useIsNoImpactWarningAccepted()
  const localFormValidation = useYieldFormState()

  const confirmText = primaryFormValidation ? 'Swap' : 'Deposit'
  const confirmTrade = tradeConfirmActions.onOpen

  const tradeFormButtonContext = useTradeFormButtonContext(confirmText, confirmTrade)

  const isDisabled = !isTradeContextReady || !feeWarningAccepted || !isNoImpactWarningAccepted

  if (!tradeFormButtonContext) return null

  if (localFormValidation) {
    const button = yieldTradeButtonsMap[localFormValidation]

    return (
      <TradeFormBlankButton id={button.id} disabled={true}>
        <Trans>{button.text}</Trans>
      </TradeFormBlankButton>
    )
  }

  return (
    <StyledTradeFormButtons
      active={!primaryFormValidation && isOutputLpToken}
      confirmText={confirmText}
      validation={primaryFormValidation}
      context={tradeFormButtonContext}
      isDisabled={isDisabled}
    />
  )
}
