import { useCallback } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { useTokensByAddressMap } from '@cowprotocol/tokens'
import { ClosableBanner } from '@cowprotocol/ui'
import { useIsSmartContractWallet, useWalletInfo } from '@cowprotocol/wallet'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { useIsDarkMode } from 'legacy/state/user/hooks'

import { useTradeNavigate } from 'modules/trade'
import { getDefaultTradeRawState } from 'modules/trade/types/TradeRawState'
import { useYieldRawState } from 'modules/yield'
import { useVampireAttack, useVampireAttackFirstTarget } from 'modules/yield/shared'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'
import { BANNER_IDS } from 'common/constants/banners'
import { Routes } from 'common/constants/routes'
import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'
import { CoWAmmBannerContent } from 'common/pure/CoWAmmBannerContent'

interface BannerProps {
  isTokenSelectorView?: boolean
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
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
  const cowAnalytics = useCowAnalytics()

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
      category: CowSwapAnalyticsCategory.COWSWAP,
      action: `CoW AMM Banner [${key}] CTA Clicked`,
    })

    tradeNavigate(chainId, targetTrade, targetTradeParams, Routes.YIELD)
  }, [key, chainId, yieldState, vampireAttackFirstTarget, tradeNavigate, cowAnalytics])

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
      onClose={close}
      data-click-event={toCowSwapGtmEvent({
        category: CowSwapAnalyticsCategory.COWSWAP,
        action: `CoW AMM Banner [${key}] Close`,
      })}
    />
  ))
}
