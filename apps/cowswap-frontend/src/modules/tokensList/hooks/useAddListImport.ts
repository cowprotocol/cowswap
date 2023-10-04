import { useSetAtom } from 'jotai/index'
import { useCallback } from 'react'

import { TokenListInfo } from '@cowprotocol/tokens'

import { updateSelectTokenWidgetAtom } from '../state/selectTokenWidgetAtom'

export function useAddListImport() {
  const updateSelectTokenWidget = useSetAtom(updateSelectTokenWidgetAtom)

  return useCallback(
    (listToImport: TokenListInfo) => {
      updateSelectTokenWidget({
        listToImport,
      })
    },
    [updateSelectTokenWidget]
  )
}
