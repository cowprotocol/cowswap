import { useCallback } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { useAddUserToken } from '@cowprotocol/tokens'

import { useTokenDataSources } from './useTokenDataSources'

import { useCloseTokenSelectWidget } from '../../../hooks/useCloseTokenSelectWidget'
import { persistRecentTokenSelection } from '../../../hooks/useRecentTokens'
import { useSelectTokenWidgetState } from '../../../hooks/useSelectTokenWidgetState'

export function useImportTokenAndClose(): (tokens: TokenWithLogo[]) => void {
  const { onSelectToken } = useSelectTokenWidgetState()
  const closeWidget = useCloseTokenSelectWidget()
  const importToken = useAddUserToken()
  const { favoriteTokens } = useTokenDataSources()

  return useCallback(
    (tokens: TokenWithLogo[]) => {
      importToken(tokens)
      const [selectedToken] = tokens

      if (selectedToken) {
        persistRecentTokenSelection(selectedToken, favoriteTokens)
        onSelectToken?.(selectedToken)
      }

      closeWidget()
    },
    [importToken, onSelectToken, closeWidget, favoriteTokens],
  )
}
