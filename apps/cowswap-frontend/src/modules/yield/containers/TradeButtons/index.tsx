import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { useIsNoImpactWarningAccepted, useTradeConfirmActions } from 'modules/trade'
import { TradeFormButtons, useGetTradeFormValidation, useTradeFormButtonContext } from 'modules/tradeFormValidation'
import { useHighFeeWarning } from 'modules/tradeWidgetAddons'

const StyledTradeFormButtons = styled((props) => <TradeFormButtons {...props} />)<{ active: boolean }>`
  background: ${({ active }) => (active ? `var(${UI.COLOR_COWAMM_DARK_GREEN})` : null)};
  color: ${({ active }) => (active ? `var(${UI.COLOR_COWAMM_LIGHT_GREEN})` : null)};
`

interface TradeButtonsProps {
  isTradeContextReady: boolean
  isOutputLpToken: boolean
}

export function TradeButtons({ isTradeContextReady, isOutputLpToken }: TradeButtonsProps) {
  const primaryFormValidation = useGetTradeFormValidation()
  const tradeConfirmActions = useTradeConfirmActions()
  const { feeWarningAccepted } = useHighFeeWarning()
  const isNoImpactWarningAccepted = useIsNoImpactWarningAccepted()

  const confirmText = primaryFormValidation ? 'Swap' : 'Deposit'
  const confirmTrade = tradeConfirmActions.onOpen

  const tradeFormButtonContext = useTradeFormButtonContext(confirmText, confirmTrade)

  const isDisabled = !isTradeContextReady || !feeWarningAccepted || !isNoImpactWarningAccepted

  if (!tradeFormButtonContext) return null

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
