import { useCallback } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'

import { useUpdateSelectTokenWidgetState } from './useUpdateSelectTokenWidgetState'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useAddTokenImportCallback() {
  const updateSelectTokenWidget = useUpdateSelectTokenWidgetState()

  return useCallback(
    (tokenToImport: TokenWithLogo) => {
      updateSelectTokenWidget({
        tokenToImport,
      })
    },
    [updateSelectTokenWidget]
  )
}
