import { useSetAtom } from 'jotai'

import { removeSnackbarAtom } from '../state/snackbarsAtom'

export function useRemoveSnackbar(): (id: string) => void {
  return useSetAtom(removeSnackbarAtom)
}