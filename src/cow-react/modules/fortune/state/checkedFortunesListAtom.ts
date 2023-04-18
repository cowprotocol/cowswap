import { atomWithStorage } from 'jotai/utils'
import { atom } from 'jotai'

// Map {id: timestamp}
export const checkedFortunesListAtom = atomWithStorage<{ [id: number]: number }>('checkedFortunesList', {})

export const lastCheckedFortuneAtom = atom((get) => {
  const list = get(checkedFortunesListAtom)

  return (
    Object.values(list).reduce((biggestTimestamp, value) => {
      if (value > biggestTimestamp) return value

      return biggestTimestamp
    }, 0) || null
  )
})
