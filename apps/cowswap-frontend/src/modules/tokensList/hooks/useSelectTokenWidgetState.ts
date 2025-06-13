import { useAtomValue } from 'jotai'

import { selectTokenWidgetAtom } from '../state/selectTokenWidgetAtom'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useSelectTokenWidgetState() {
  return useAtomValue(selectTokenWidgetAtom)
}
