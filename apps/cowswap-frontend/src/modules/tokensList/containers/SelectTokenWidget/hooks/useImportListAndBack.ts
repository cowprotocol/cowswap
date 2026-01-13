import { useCallback } from 'react'

import { ListState } from '@cowprotocol/tokens'

import { useTokenAdminActions } from './useTokenAdminActions'

import { useCloseTokenSelectWidget } from '../../../hooks/useCloseTokenSelectWidget'
import { useOnTokenListAddingError } from '../../../hooks/useOnTokenListAddingError'
import { useUpdateSelectTokenWidgetState } from '../../../hooks/useUpdateSelectTokenWidgetState'

export function useImportListAndBack(): (list: ListState) => void {
  const closeWidget = useCloseTokenSelectWidget()
  const updateWidget = useUpdateSelectTokenWidgetState()
  const onTokenListAddingError = useOnTokenListAddingError()
  const { addCustomTokenLists } = useTokenAdminActions()

  return useCallback(
    (list: ListState) => {
      try {
        addCustomTokenLists(list)
      } catch (error) {
        closeWidget()
        onTokenListAddingError(error as Error)
      }
      updateWidget({ listToImport: undefined })
    },
    [addCustomTokenLists, closeWidget, onTokenListAddingError, updateWidget],
  )
}
