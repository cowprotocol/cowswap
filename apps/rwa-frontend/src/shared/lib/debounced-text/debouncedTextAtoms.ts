import { type Atom, atom, type WritableAtom } from 'jotai'

export interface DebouncedTextAtoms {
  /** Updated on every write */
  valueAtom: Atom<string>
  /** Trimmed value, updated `delayMs` after the last write */
  debouncedValueAtom: Atom<string>
  setValueAtom: WritableAtom<null, [string], void>
}

export function debouncedTextAtoms(delayMs: number): DebouncedTextAtoms {
  const valueAtom = atom('')
  const debouncedValueAtom = atom('')
  const timeoutAtom = atom<ReturnType<typeof setTimeout> | undefined>(undefined)

  const setValueAtom = atom(null, (get, set, value: string) => {
    set(valueAtom, value)
    clearTimeout(get(timeoutAtom))
    set(
      timeoutAtom,
      setTimeout(() => set(debouncedValueAtom, value.trim()), delayMs),
    )
  })

  return { valueAtom, debouncedValueAtom, setValueAtom }
}
