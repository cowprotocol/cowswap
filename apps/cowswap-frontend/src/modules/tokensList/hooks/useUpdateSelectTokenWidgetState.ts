import { useSetAtom } from 'jotai/index'

import { updateSelectTokenWidgetAtom } from '../state/selectTokenWidgetAtom'

export function useUpdateSelectTokenWidgetState() {
  return useSetAtom(updateSelectTokenWidgetAtom)
}
