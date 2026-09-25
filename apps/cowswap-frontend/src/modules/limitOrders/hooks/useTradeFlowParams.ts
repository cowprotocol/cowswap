import { useCallback, useMemo } from 'react'

import { Config, useConfig } from 'wagmi'

import { getAddress } from '@cowprotocol/common-utils'
import { Percent } from '@cowprotocol/currency'
import { Command } from '@cowprotocol/types'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { TradeConfirmActions, TradeFlowAnalytics, useTradeFlowAnalytics } from 'modules/trade'

import { useConfirmPriceImpactWithoutFee } from 'common/hooks/useConfirmPriceImpactWithoutFee'
import { TradeAmounts } from 'common/types'
import { getAreBridgeCurrencies } from 'common/utils/getAreBridgeCurrencies'

import { useTradeFlowContext } from './useTradeFlowContext'

import { TradeFlowContext } from '../services/types'
import { LimitOrdersSettingsState } from '../state/limitOrdersSettingsAtom'

export interface TradeFlowParams {
  priceImpact: PriceImpact
  settingsState: LimitOrdersSettingsState
  confirmPriceImpactWithoutFee: (priceImpact: Percent) => Promise<boolean>
  analytics: TradeFlowAnalytics
  beforeTrade: Command
  beforePermit: Command
  config: Config
}

export function useTradeFlowParams(
  priceImpact: PriceImpact,
  settingsState: LimitOrdersSettingsState,
  tradeConfirmActions: TradeConfirmActions,
): TradeFlowParams {
  const config = useConfig()
  const tradeContext = useTradeFlowContext()
  const isBridge = getAreBridgeCurrencies(
    tradeContext?.postOrderParams.inputAmount.currency,
    tradeContext?.postOrderParams.outputAmount.currency,
  )
  const { confirmPriceImpactWithoutFee } = useConfirmPriceImpactWithoutFee(isBridge)

  const analytics = useTradeFlowAnalytics()

  const beforeTrade = useCallback(() => {
    if (!tradeContext) return

    tradeConfirmActions.onSign(buildTradeAmounts(tradeContext))
  }, [tradeContext, tradeConfirmActions])

  const beforePermit = useCallback(async () => {
    if (!tradeContext) return

    const {
      postOrderParams: { inputAmount },
      getCachedPermit,
    } = tradeContext
    const inputCurrency = inputAmount.currency

    const cachedPermit = await getCachedPermit(getAddress(inputCurrency))

    if (cachedPermit) return

    tradeConfirmActions.requestPermitSignature(buildTradeAmounts(tradeContext))
  }, [tradeConfirmActions, tradeContext])

  return useMemo(() => {
    return {
      priceImpact,
      settingsState,
      confirmPriceImpactWithoutFee,
      analytics,
      beforeTrade,
      beforePermit,
      config,
    }
  }, [priceImpact, settingsState, confirmPriceImpactWithoutFee, analytics, beforeTrade, beforePermit, config])
}

function buildTradeAmounts(tradeContext: TradeFlowContext): TradeAmounts {
  return {
    inputAmount: tradeContext.postOrderParams.inputAmount,
    outputAmount: tradeContext.postOrderParams.outputAmount,
  }
}
