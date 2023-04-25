import { useAtom, useAtomValue } from 'jotai'
import { fortunesListAtom } from '@cow/modules/fortune/state/fortunesListAtom'
import { useCallback } from 'react'
import { getRandomInt } from '@cow/utils/getRandomInt'
import { CheckedFortunesList, checkedFortunesListAtom } from '@cow/modules/fortune/state/checkedFortunesListAtom'
import { updateOpenFortuneAtom } from '@cow/modules/fortune/state/fortuneStateAtom'
import { useUpdateAtom } from 'jotai/utils'
import { FortuneItem } from '@cow/modules/fortune/types'

function getRandomFortuneFromList(items: FortuneItem[], checkedFortunes: CheckedFortunesList): FortuneItem | null {
  const list = items.filter((item) => !checkedFortunes[item.id])
  const index = getRandomInt(0, list.length - 1)

  return list[index] || null
}

export function useOpenRandomFortune() {
  const fortunesList = useAtomValue(fortunesListAtom)
  const setOpenFortuneAtom = useUpdateAtom(updateOpenFortuneAtom)
  const [checkedFortunes, setCheckedFortunes] = useAtom(checkedFortunesListAtom)

  return useCallback(() => {
    if (fortunesList.state !== 'hasData' || !fortunesList.data.length) return

    let fortune = getRandomFortuneFromList(fortunesList.data, checkedFortunes)

    // When all fortunes are checked, then reset the list
    if (!fortune) {
      setCheckedFortunes({})
      fortune = getRandomFortuneFromList(fortunesList.data, {})!
    }

    setCheckedFortunes({ ...checkedFortunes, [fortune.id]: Date.now() })
    setOpenFortuneAtom(fortune)
  }, [fortunesList, checkedFortunes, setCheckedFortunes, setOpenFortuneAtom])
}
