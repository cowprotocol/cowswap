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

import { useVampireAttack } from './useVampireAttack'

import { Routes } from '../../constants/routes'
import { useIsProviderNetworkUnsupported } from '../../hooks/useIsProviderNetworkUnsupported'
import { CoWAmmBannerContent } from '../../pure/CoWAmmBannerContent'

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

  const key = isTokenSelectorView ? 'tokenSelector' : 'global'
  const handleCTAClick = useCallback(() => {
    const superiorAlternative = vampireAttackContext?.superiorAlternatives?.[0]
    const alternative = vampireAttackContext?.alternatives?.[0]
    const target = superiorAlternative || alternative

    const targetTrade = {
      inputCurrencyId: target?.token.address || null,
      outputCurrencyId: target?.alternative.address || null,
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
  }, [key, chainId, vampireAttackContext, tradeNavigate])

  const handleClose = useCallback(() => {
    cowAnalytics.sendEvent({
      category: 'CoW Swap',
      action: `CoW AMM Banner [${key}] Closed`,
    })
  }, [key])

  const bannerId = `cow_amm_banner_2024_va_${key}`

  const isSmartContractWallet = useIsSmartContractWallet()

  if (isInjectedWidgetMode || !account || isChainIdUnsupported || !vampireAttackContext) return null

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
