import { useSetAtom } from 'jotai'

import { addSnackbarAtom, SnackbarItem } from '../state/snackbarsAtom'

export function useAddSnackbar(): (item: SnackbarItem) => void {
  return useSetAtom(addSnackbarAtom)
}
