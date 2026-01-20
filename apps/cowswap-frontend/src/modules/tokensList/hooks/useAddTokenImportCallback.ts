import { useCallback } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'

import { useUpdateSelectTokenWidgetState } from './useUpdateSelectTokenWidgetState'

/**
 * Callback to set a token for import.
 * The actual consent/restriction logic is handled by the token selector's customFlows.
 */
export function useAddTokenImportCallback(): (tokenToImport: TokenWithLogo) => void {
  const updateSelectTokenWidget = useUpdateSelectTokenWidgetState()

  return useCallback(
    (tokenToImport: TokenWithLogo) => {
      updateSelectTokenWidget({ tokenToImport })
    },
    [updateSelectTokenWidget],
  )
}
