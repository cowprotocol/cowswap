import { useCallback } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { ListState, useAddUserToken } from '@cowprotocol/tokens'

import { persistRecentTokenSelection } from '../../../hooks/useRecentTokens'
import { TokenSelectionHandler } from '../../../types'

import type { useUpdateSelectTokenWidgetState } from '../../../hooks/useUpdateSelectTokenWidgetState'

type UpdateSelectTokenWidgetFn = ReturnType<typeof useUpdateSelectTokenWidgetState>

export interface ImportFlowCallbacks {
  importTokenAndClose(tokens: TokenWithLogo[]): void
  importListAndBack(list: ListState): void
  resetTokenImport(): void
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
