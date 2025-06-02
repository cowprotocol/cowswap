import { useAtomValue } from 'jotai'

import { selectTokenWidgetAtom } from '../state/selectTokenWidgetAtom'

export function useSelectTokenWidgetState() {
  return useAtomValue(selectTokenWidgetAtom)
}
