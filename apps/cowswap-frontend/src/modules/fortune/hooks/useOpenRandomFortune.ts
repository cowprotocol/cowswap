import { useAtom, useAtomValue } from 'jotai'
import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { getRandomInt } from '@cowprotocol/common-utils'

import { CheckedFortunesList, checkedFortunesListAtom } from 'modules/fortune/state/checkedFortunesListAtom'
import { fortunesListAtom } from 'modules/fortune/state/fortunesListAtom'
import { updateOpenFortuneAtom } from 'modules/fortune/state/fortuneStateAtom'
import { FortuneItem } from 'modules/fortune/types'

function getRandomFortuneFromList(items: FortuneItem[], checkedFortunes: CheckedFortunesList): FortuneItem | null {
  const list = items.filter((item) => !checkedFortunes[item.id])
  const index = getRandomInt(0, list.length - 1)

  return list[index] || null
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useOpenRandomFortune() {
  const fortunesList = useAtomValue(fortunesListAtom)
  const setOpenFortuneAtom = useSetAtom(updateOpenFortuneAtom)
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
