import { useCallback } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { isSupportedChainId } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Field } from 'legacy/state/types'

import { TradeType } from 'modules/trade/types'

import { useOnSelectNetwork } from 'common/hooks/useOnSelectNetwork'

import { useSelectTokenWidgetState } from '../../../hooks/useSelectTokenWidgetState'
import { TokenSelectionHandler } from '../../../types'

interface ShouldSwitchNetworkParams {
  field: Field | undefined
  tradeType: TradeType | undefined
  targetChainId: number | undefined
  walletChainId: SupportedChainId
}

function getNetworkToSwitch(params: ShouldSwitchNetworkParams): SupportedChainId | null {
  const { field, tradeType, targetChainId, walletChainId } = params

  const shouldSwitch =
    field === Field.INPUT &&
    (tradeType === TradeType.LIMIT_ORDER || tradeType === TradeType.ADVANCED_ORDERS) &&
    isSupportedChainId(targetChainId) &&
    targetChainId !== walletChainId

  return shouldSwitch ? targetChainId : null
}

export function useTokenSelectionHandler(
  onSelectToken: TokenSelectionHandler | undefined,
  widgetState: ReturnType<typeof useSelectTokenWidgetState>,
): TokenSelectionHandler {
  const { chainId: walletChainId } = useWalletInfo()
  const onSelectNetwork = useOnSelectNetwork()

  return useCallback(
    async (token: TokenWithLogo) => {
      const chainToSwitch = getNetworkToSwitch({
        field: widgetState.field,
        tradeType: widgetState.tradeType,
        targetChainId: widgetState.selectedTargetChainId,
        walletChainId,
      })

      if (chainToSwitch) {
        try {
          await onSelectNetwork(chainToSwitch, true)
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error)
          console.debug(`Failed to switch network after token selection: ${message}`)
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
