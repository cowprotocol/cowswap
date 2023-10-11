import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'

import { updateSelectTokenWidgetAtom } from '../state/selectTokenWidgetAtom'

export function useAddTokenImportCallback() {
  const updateSelectTokenWidget = useSetAtom(updateSelectTokenWidgetAtom)

  return useCallback(
    (tokenToImport: TokenWithLogo) => {
      updateSelectTokenWidget({
        tokenToImport,
      })
    },
    [updateSelectTokenWidget]
  )
}
