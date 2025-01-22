import { useAtom } from 'jotai'
import { useCallback } from 'react'

import { useTradeNavigate } from 'modules/trade'

import { Routes } from '../../constants/routes'
import { LimitOrdersPromoBanner as LimitOrdersPromoBannerPure } from '../../pure/LimitOrdersPromoBanner'
import { limitOrdersPromoDismissedAtom } from '../../state/limitOrdersPromoAtom'

interface LimitOrdersPromoBannerProps {
  isLimitOrdersTab?: boolean
}

export function LimitOrdersPromoBanner({ isLimitOrdersTab = false }: LimitOrdersPromoBannerProps) {
  const [isDismissed, setIsDismissed] = useAtom(limitOrdersPromoDismissedAtom)
  const tradeNavigate = useTradeNavigate()

  const handleDismiss = useCallback(() => {
    setIsDismissed(true)
  }, [setIsDismissed])

  const handleCtaClick = useCallback(() => {
    // First dismiss the banner
    setIsDismissed(true)
    // Then navigate to limit orders
    const emptyTradeParams = { inputCurrencyId: null, outputCurrencyId: null }
    tradeNavigate(undefined, emptyTradeParams, undefined, Routes.LIMIT_ORDER)
  }, [tradeNavigate, setIsDismissed])

  if (isDismissed) {
    return null
  }

  return (
    <LimitOrdersPromoBannerPure
      onCtaClick={handleCtaClick}
      onDismiss={handleDismiss}
      isLimitOrdersTab={isLimitOrdersTab}
    />
  )
}
