import { useCallback } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { log } from '@cowprotocol/sdk-common'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Field } from 'legacy/state/types'

import { TradeType } from 'modules/trade/types'

import { useOnSelectNetwork } from 'common/hooks/useOnSelectNetwork'

import { useSelectTokenWidgetState } from '../../../hooks/useSelectTokenWidgetState'
import { TokenSelectionHandler } from '../../../types'

export function useTokenSelectionHandler(
  onSelectToken: TokenSelectionHandler | undefined,
  widgetState: ReturnType<typeof useSelectTokenWidgetState>,
): TokenSelectionHandler {
  const { chainId: walletChainId } = useWalletInfo()
  const onSelectNetwork = useOnSelectNetwork()

  return useCallback(
    async (token: TokenWithLogo) => {
      const targetChainId = widgetState.selectedTargetChainId
      const shouldSwitchWalletNetwork =
        widgetState.field === Field.INPUT &&
        (widgetState.tradeType === TradeType.LIMIT_ORDER || widgetState.tradeType === TradeType.ADVANCED_ORDERS) &&
        typeof targetChainId === 'number' &&
        targetChainId !== walletChainId

      if (shouldSwitchWalletNetwork && targetChainId in SupportedChainId) {
        try {
          await onSelectNetwork(targetChainId as SupportedChainId, true)
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error)
          log(`Failed to switch network after token selection: ${message}`)
        }
      }

      onSelectToken?.(token)
    },
    [
      onSelectToken,
      widgetState.field,
      widgetState.tradeType,
      widgetState.selectedTargetChainId,
      walletChainId,
      onSelectNetwork,
    ],
  )
}
