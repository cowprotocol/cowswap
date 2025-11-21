import { useApplyTradeStateFromUrlEffect } from './useApplyTradeStateFromUrlEffect'
import { useHandleProviderChainChangeEffect } from './useHandleProviderChainChangeEffect'
import { useResetStateWithSymbolDuplication } from './useResetStateWithSymbolDuplication'
import { useSetupTradeStateContext } from './useSetupTradeStateContext'
import { useUrlAndProviderChainSyncEffect } from './useUrlAndProviderChainSyncEffect'

export function useSetupTradeState(): void {
  const context = useSetupTradeStateContext()

  useApplyTradeStateFromUrlEffect(context)
  useUrlAndProviderChainSyncEffect(context)
  useHandleProviderChainChangeEffect(context)

  useResetStateWithSymbolDuplication(context.state || null)
}
