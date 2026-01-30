import { atom, SetStateAction, WritableAtom } from 'jotai'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function atomWithPartialUpdate<T>(anyAtom: WritableAtom<T, any, any>): {
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
