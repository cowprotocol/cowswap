import { useCallback, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { log } from '@cowprotocol/sdk-common'
import { ListState, useAddUserToken } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Field } from 'legacy/state/types'

import { TradeType } from 'modules/trade/types'

import { useOnSelectNetwork } from 'common/hooks/useOnSelectNetwork'

import { persistRecentTokenSelection, useRecentTokens } from '../../hooks/useRecentTokens'
import { useSelectTokenWidgetState } from '../../hooks/useSelectTokenWidgetState'
import { TokenSelectionHandler } from '../../types'

import type { useUpdateSelectTokenWidgetState } from '../../hooks/useUpdateSelectTokenWidgetState'

type UpdateSelectTokenWidgetFn = ReturnType<typeof useUpdateSelectTokenWidgetState>

interface ImportFlowCallbacks {
  importTokenAndClose(tokens: TokenWithLogo[]): void
  importListAndBack(list: ListState): void
  resetTokenImport(): void
}

interface RecentTokenSection {
  recentTokens: TokenWithLogo[]
  handleTokenListItemClick(token: TokenWithLogo): void
  clearRecentTokens(): void
}

export function useImportFlowCallbacks(
  importTokenCallback: ReturnType<typeof useAddUserToken>,
  onSelectToken: TokenSelectionHandler | undefined,
  onDismiss: () => void,
  addCustomTokenLists: (list: ListState) => void,
  onTokenListAddingError: (error: Error) => void,
  updateSelectTokenWidget: UpdateSelectTokenWidgetFn,
  favoriteTokens: TokenWithLogo[],
): ImportFlowCallbacks {
  const importTokenAndClose = useCallback(
    (tokens: TokenWithLogo[]) => {
      importTokenCallback(tokens)
      const [selectedToken] = tokens

      if (selectedToken) {
        persistRecentTokenSelection(selectedToken, favoriteTokens)
        onSelectToken?.(selectedToken)
      }

      onDismiss()
    },
    [importTokenCallback, onSelectToken, onDismiss, favoriteTokens],
  )

  const importListAndBack = useCallback(
    (list: ListState) => {
      try {
        addCustomTokenLists(list)
      } catch (error) {
        onDismiss()
        onTokenListAddingError(error as Error)
      }
      updateSelectTokenWidget({ listToImport: undefined })
    },
    [addCustomTokenLists, onDismiss, onTokenListAddingError, updateSelectTokenWidget],
  )

  const resetTokenImport = useCallback(() => {
    updateSelectTokenWidget({ tokenToImport: undefined })
  }, [updateSelectTokenWidget])

  return { importTokenAndClose, importListAndBack, resetTokenImport }
}

export function useRecentTokenSection(
  allTokens: TokenWithLogo[],
  favoriteTokens: TokenWithLogo[],
  activeChainId?: number,
): RecentTokenSection {
  const { recentTokens, addRecentToken, clearRecentTokens } = useRecentTokens({
    allTokens,
    favoriteTokens,
    activeChainId,
  })

  const handleTokenListItemClick = useCallback(
    (token: TokenWithLogo) => {
      addRecentToken(token)
    },
    [addRecentToken],
  )

  return useMemo(
    () => ({ recentTokens, handleTokenListItemClick, clearRecentTokens }),
    [recentTokens, handleTokenListItemClick, clearRecentTokens],
  )
}

export function useTokenSelectionHandler(
  onSelectToken: TokenSelectionHandler | undefined,
  widgetState: ReturnType<typeof useSelectTokenWidgetState>,
): TokenSelectionHandler {
  const { chainId: walletChainId } = useWalletInfo()
  const onSelectNetwork = useOnSelectNetwork()

  return useCallback(
    async (token: TokenWithLogo) => {
      const targetChainId = widgetState.selectedTargetChainId
      // SELL-side limit/TWAP orders must run on the picked network,
      // so nudge the wallet onto that chain before finalizing selection.
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
