import { atom, PrimitiveAtom, SetStateAction, WritableAtom } from 'jotai'

export function atomWithPartialUpdate<T>(anyAtom: PrimitiveAtom<T>): {
  atom: typeof anyAtom
  updateAtom: WritableAtom<null, [SetStateAction<Partial<T>>], void>
} {
  const updateAtom = atom(null, (get, set, nextState: SetStateAction<Partial<T>>) => {
    set(anyAtom, () => {
      const prevState = get(anyAtom)
      const update = typeof nextState === 'function' ? nextState(prevState) : nextState

      return { ...prevState, ...update }
    })
  })

  return {
    atom: anyAtom,
    updateAtom,
  }
}
