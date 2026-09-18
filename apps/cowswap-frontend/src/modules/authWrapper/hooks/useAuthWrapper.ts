import { useMemo } from 'react'

import { resolveFlexibleConfig, TradeType } from '@cowprotocol/widget-lib'

import { useInjectedWidgetParams } from 'entities/injectedWidget'

import { resolveAuthWrapper } from '../utils/resolveAuthWrapper'

import type { ResolvedAuthWrapper } from '../authWrapper.types'

/**
 * The `CowAuthWrapper` configured for the active chain and trade type, or `null`.
 */
export function useAuthWrapper(chainId: number, tradeType: TradeType | undefined): ResolvedAuthWrapper | null {
  const { authWrapper } = useInjectedWidgetParams()

  return useMemo(() => {
    if (!authWrapper || !tradeType) return null

    const config = resolveFlexibleConfig(authWrapper, chainId, tradeType)

    if (!config) return null

    try {
      return resolveAuthWrapper(config)
    } catch {
      return null
    }
  }, [authWrapper, chainId, tradeType])
}
