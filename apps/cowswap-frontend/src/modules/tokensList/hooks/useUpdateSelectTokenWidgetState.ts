import { useSetAtom } from 'jotai'

import { updateSelectTokenWidgetAtom } from '../state/selectTokenWidgetAtom'

export function useUpdateSelectTokenWidgetState() {
  return useSetAtom(updateSelectTokenWidgetAtom)
}
