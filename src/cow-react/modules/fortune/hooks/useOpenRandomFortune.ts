import { useAtom, useAtomValue } from 'jotai'
import { fortunesListAtom } from '@cow/modules/fortune/state/fortunesListAtom'
import { useCallback } from 'react'
import { getRandomInt } from '@cow/utils/getRandomInt'
import { checkedFortunesListAtom } from '@cow/modules/fortune/state/checkedFortunesListAtom'
import { updateOpenFortuneAtom } from '@cow/modules/fortune/state/fortuneStateAtom'
import { useUpdateAtom } from 'jotai/utils'

export function useOpenRandomFortune() {
  const fortunesList = useAtomValue(fortunesListAtom)
  const setOpenFortuneAtom = useUpdateAtom(updateOpenFortuneAtom)
  const [checkedFortunes, setCheckedFortunes] = useAtom(checkedFortunesListAtom)

  return useCallback(() => {
    if (fortunesList.state !== 'hasData') return

    const list = fortunesList.data.filter((item) => !checkedFortunes[item.id])
    // TODO: What to do when there are no fortunes anymore?
    const index = getRandomInt(0, list.length - 1)
    const fortune = list[index]

    if (!fortune) return

    setCheckedFortunes({ ...checkedFortunes, [fortune.id]: Math.round(Date.now() / 1000) })
    setOpenFortuneAtom({ openFortune: fortune, isFortuneButtonVisible: false })
  }, [fortunesList, checkedFortunes, setCheckedFortunes, setOpenFortuneAtom])
}
