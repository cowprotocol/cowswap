import React, { isValidElement } from 'react'

import { MessageDescriptor } from '@lingui/core'

import { IS_SOLANA_ENABLED } from '@cowprotocol/common-const'
import { isSolanaChain } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useLingui } from '@lingui/react/macro'

import { useLimitOrdersWarningsAccepted } from 'modules/limitOrders/hooks/useLimitOrdersWarningsAccepted'
import { useConfirmTradeWithRwaCheck } from 'modules/trade'
import {
  TradeFormBlankButton,
  TradeFormButtons,
  useGetTradeFormValidation,
  useTradeFormButtonContext,
} from 'modules/tradeFormValidation'
import { TradeFormValidation } from 'modules/tradeFormValidation/types'

import { limitOrdersTradeButtonsMap } from './limitOrdersTradeButtonsMap'

import { useLimitOrdersFormState } from '../../hooks/useLimitOrdersFormState'

const PRIMARY_VALIDATION_OVERRIDEN_BY_LOCAL_VALIDATION: TradeFormValidation[] = [
  TradeFormValidation.ApproveAndSwapInBundle,
  TradeFormValidation.ApproveRequired,
]

interface TradeButtonsProps {
  isTradeContextReady: boolean
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function TradeButtons({ isTradeContextReady }: TradeButtonsProps) {
  const { i18n, t } = useLingui()
  const { chainId } = useWalletInfo()
  const CONFIRM_TEXT = t`Review limit order`
  const localFormValidation = useLimitOrdersFormState()
  const primaryFormValidation = useGetTradeFormValidation()
  const warningsAccepted = useLimitOrdersWarningsAccepted(false)

  const { confirmTrade } = useConfirmTradeWithRwaCheck()

  const tradeFormButtonContext = useTradeFormButtonContext(CONFIRM_TEXT, confirmTrade)

  const skipTradeContextReadyGate = IS_SOLANA_ENABLED && isSolanaChain(chainId)
  const isDisabled = !warningsAccepted || (!skipTradeContextReadyGate && !isTradeContextReady)

  if (!tradeFormButtonContext) return null

  // Display local form validation errors only when there are no primary errors
  if (
    (!primaryFormValidation ||
      PRIMARY_VALIDATION_OVERRIDEN_BY_LOCAL_VALIDATION.indexOf(primaryFormValidation) !== -1) &&
    localFormValidation
  ) {
    const buttonFactory = limitOrdersTradeButtonsMap[localFormValidation]

    return typeof buttonFactory === 'function' ? (
      buttonFactory()
    ) : (
      <TradeFormBlankButton id={buttonFactory.id} disabled={true}>
        {isValidElement(buttonFactory.text) ? buttonFactory.text : i18n._(buttonFactory.text as MessageDescriptor)}
      </TradeFormBlankButton>
    )
  }

  return (
    <TradeFormButtons
      confirmText={CONFIRM_TEXT}
      validation={primaryFormValidation}
      context={tradeFormButtonContext}
      isDisabled={isDisabled}
    />
  )
}
