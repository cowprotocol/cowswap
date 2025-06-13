import { useSetAtom } from 'jotai'

import { updateSelectTokenWidgetAtom } from '../state/selectTokenWidgetAtom'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useUpdateSelectTokenWidgetState() {
  return useSetAtom(updateSelectTokenWidgetAtom)
}
