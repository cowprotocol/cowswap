import { PrimitiveAtom, WritableAtom } from 'jotai'
import { atom } from 'jotai/index'

export function atomWithPartialUpdate<T>(anyAtom: PrimitiveAtom<T>): {
  atom: typeof anyAtom
  updateAtom: WritableAtom<null, [nextState: Partial<T>], void>
} {
  const updateAtom = atom(null, (get, set, nextState: Partial<T>) => {
    set(anyAtom, () => {
      const prevState = get(anyAtom)

      return { ...prevState, ...nextState }
    })
  })

  return {
    atom: anyAtom,
    updateAtom,
  }
}
