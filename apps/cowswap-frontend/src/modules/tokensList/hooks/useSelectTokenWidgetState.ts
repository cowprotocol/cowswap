import { useAtomValue } from 'jotai'

import { selectTokenWidgetAtom, SelectTokenWidgetState } from '../state/selectTokenWidgetAtom'

export function useSelectTokenWidgetState(): SelectTokenWidgetState {
  return useAtomValue(selectTokenWidgetAtom)
}
