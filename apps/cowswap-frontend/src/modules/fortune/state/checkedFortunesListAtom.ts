import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { fortunesListAtom } from 'modules/fortune/state/fortunesListAtom'

// Map {id: timestamp (when a fortune was checked)}
export type CheckedFortunesList = { [id: number]: number }

export const checkedFortunesListAtom = atomWithStorage<CheckedFortunesList>('checkedFortunesList', {})

const lastCheckedFortuneIdAtom = atom((get) => {
  const list = get(checkedFortunesListAtom)
  const keys = Object.keys(list)
  const timestamps = Object.values(list)
  const biggestTimestamp = timestamps.reduce((timestamp, value) => (value > timestamp ? value : timestamp), 0)
  const lastCheckedFortuneId = keys.find((key) => list[+key] === biggestTimestamp)

  return lastCheckedFortuneId ? +lastCheckedFortuneId : null
})

export const lastCheckedFortuneAtom = atom((get) => {
  const list = get(checkedFortunesListAtom)
  const lastCheckedFortuneId = get(lastCheckedFortuneIdAtom)
  const fortunesList = get(fortunesListAtom)

  if (lastCheckedFortuneId && fortunesList.state === 'hasData') {
    const item = fortunesList.data.find((item) => item.id === lastCheckedFortuneId)

    if (!item) return null

    return {
      checkTimestamp: list[lastCheckedFortuneId],
      item,
    }
  }

  return null
})
