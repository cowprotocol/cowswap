import { useSetAtom } from 'jotai'

import { SelectTokenWidgetState, updateSelectTokenWidgetAtom } from '../state/selectTokenWidgetAtom'

export function useUpdateSelectTokenWidgetState(): (update: Partial<SelectTokenWidgetState>) => void {
  return useSetAtom(updateSelectTokenWidgetAtom)
}
