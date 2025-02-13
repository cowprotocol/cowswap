import { useCallback } from 'react'

import { isInjectedWidget } from '@cowprotocol/common-utils'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { useTokensByAddressMap } from '@cowprotocol/tokens'
import { ClosableBanner } from '@cowprotocol/ui'
import { useIsSmartContractWallet, useWalletInfo } from '@cowprotocol/wallet'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { useIsDarkMode } from 'legacy/state/user/hooks'

import { cowAnalytics } from 'modules/analytics'
import { useTradeNavigate } from 'modules/trade'
import { getDefaultTradeRawState } from 'modules/trade/types/TradeRawState'
import { useYieldRawState } from 'modules/yield'
import { useVampireAttack, useVampireAttackFirstTarget } from 'modules/yield/shared'

import { BANNER_IDS } from 'common/constants/banners'
import { Routes } from 'common/constants/routes'
import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'
import { CoWAmmBannerContent } from 'common/pure/CoWAmmBannerContent'

interface BannerProps {
  isTokenSelectorView?: boolean
}

export function CoWAmmBanner({ isTokenSelectorView }: BannerProps) {
  const isDarkMode = useIsDarkMode()
  const isInjectedWidgetMode = isInjectedWidget()
  const { chainId, account } = useWalletInfo()
  const isChainIdUnsupported = useIsProviderNetworkUnsupported()
  const vampireAttackContext = useVampireAttack()
  const tokensByAddress = useTokensByAddressMap()
  const tradeNavigate = useTradeNavigate()
  const vampireAttackFirstTarget = useVampireAttackFirstTarget()
  const isSmartContractWallet = useIsSmartContractWallet()
  const yieldState = useYieldRawState()

  const key = isTokenSelectorView ? 'tokenSelector' : 'global'
  const handleCTAClick = useCallback(() => {
    const target = vampireAttackFirstTarget?.target
    const defaulTradeState = getDefaultTradeRawState(chainId)

    const targetTrade = target
      ? {
          inputCurrencyId: target.token.address || null,
          outputCurrencyId: target.alternative.address || null,
        }
      : {
          inputCurrencyId: yieldState.inputCurrencyId || defaulTradeState.inputCurrencyId,
          outputCurrencyId: yieldState.outputCurrencyId || defaulTradeState.outputCurrencyId,
        }

    const targetTradeParams = {
      amount: target
        ? CurrencyAmount.fromRawAmount(target.token, target.tokenBalance.toString()).toFixed(6)
        : undefined,
      kind: OrderKind.SELL,
    }

    cowAnalytics.sendEvent({
      category: 'CoW Swap',
      action: `CoW AMM Banner [${key}] CTA Clicked`,
    })

    tradeNavigate(chainId, targetTrade, targetTradeParams, Routes.YIELD)
  }, [key, chainId, yieldState, vampireAttackFirstTarget, tradeNavigate])

  const handleClose = useCallback(() => {
    cowAnalytics.sendEvent({
      category: 'CoW Swap',
      action: `CoW AMM Banner [${key}] Closed`,
    })
  }, [key])

  if (isInjectedWidgetMode || !account || isChainIdUnsupported || !vampireAttackContext) return null

  const bannerId = `${BANNER_IDS.COW_AMM}_${key}${isTokenSelectorView ? account : ''}`

  return ClosableBanner(bannerId, (close) => (
    <CoWAmmBannerContent
      id={bannerId}
      isDarkMode={isDarkMode}
      title="CoW AMM"
      ctaText={isSmartContractWallet ? 'Booooost APR!' : 'Booooost APR gas-free!'}
      isTokenSelectorView={!!isTokenSelectorView}
      vampireAttackContext={vampireAttackContext}
      tokensByAddress={tokensByAddress}
      onCtaClick={() => {
        handleCTAClick()
        close()
      }}
      onClose={() => {
        handleClose()
        close()
      }}
    />
  ))
}
