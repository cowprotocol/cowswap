import { atom, PrimitiveAtom, SetStateAction } from 'jotai'

type Storage<Value> = {
  getItem: (key: string) => Value
  setItem: (key: string, newValue: Value) => void
}

const defaultStorage: Storage<unknown> = {
  getItem: (key) => {
    const storedValue = localStorage.getItem(key)
    if (storedValue === null) {
      throw new Error('no value stored')
    }
    return JSON.parse(storedValue)
  },
  setItem: (key, newValue) => {
    localStorage.setItem(key, JSON.stringify(newValue))
  },
}

export function atomWithStorage<Value>(
  key: string,
  initialValue: Value,
  storage: Storage<Value> = defaultStorage as Storage<Value>
): PrimitiveAtom<Value> {
  const getInitialValue = () => {
    try {
      return { value: storage.getItem(key), needsSetting: false }
    } catch {
      return { value: initialValue, needsSetting: true }
    }
  }

  const baseAtom = atom(initialValue)

  baseAtom.onMount = (setAtom) => {
    Promise.resolve(getInitialValue()).then(({ value, needsSetting }) => {
      if (needsSetting) {
        localStorage.setItem(key, JSON.stringify(value))
      }

      setAtom(value)
    })
  }

  const anAtom = atom(
    (get) => get(baseAtom),
    (get, set, update: SetStateAction<Value>) => {
      const newValue = typeof update === 'function' ? (update as (prev: Value) => Value)(get(baseAtom)) : update
      set(baseAtom, newValue)
      storage.setItem(key, newValue)
    }
  )

  return anAtom
}
