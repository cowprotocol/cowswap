import { useAtomValue } from 'jotai/index'

import { selectTokenWidgetAtom } from '../state/selectTokenWidgetAtom'

export function useSelectTokenWidgetState() {
  return useAtomValue(selectTokenWidgetAtom)
}
