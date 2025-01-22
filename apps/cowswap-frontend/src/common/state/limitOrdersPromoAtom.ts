import { atomWithStorage } from 'jotai/utils'

export const limitOrdersPromoDismissedAtom = atomWithStorage<boolean>('limitOrdersPromo_dismissed', false)
