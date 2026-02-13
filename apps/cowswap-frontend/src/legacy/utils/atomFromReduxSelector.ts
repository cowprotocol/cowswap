import { atom } from 'jotai'

import { shallowEqual } from 'react-redux'

import { cowSwapStore, AppState } from 'legacy/state'

export function atomFromReduxSelector<T>(
  selector: (state: AppState) => T,
  equalityFn: (a: T, b: T) => boolean = shallowEqual,
) {
  const baseAtom = atom<T>(selector(cowSwapStore.getState()))

  baseAtom.onMount = (set) => {
    let prev = selector(cowSwapStore.getState())

    const unsubscribe = cowSwapStore.subscribe(() => {
      const next = selector(cowSwapStore.getState())
      if (!equalityFn(prev, next)) {
        prev = next
        set(next)
      }
    })

    return unsubscribe
  }

  return baseAtom
}
