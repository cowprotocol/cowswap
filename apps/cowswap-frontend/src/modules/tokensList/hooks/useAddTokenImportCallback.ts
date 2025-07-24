import { useCallback } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'

import { useUpdateSelectTokenWidgetState } from './useUpdateSelectTokenWidgetState'

export function useAddTokenImportCallback(): (tokenToImport: TokenWithLogo) => void {
  const updateSelectTokenWidget = useUpdateSelectTokenWidgetState()

  return useCallback(
    (tokenToImport: TokenWithLogo) => {
      updateSelectTokenWidget({
        tokenToImport,
      })
    },
    [updateSelectTokenWidget],
  )
}
