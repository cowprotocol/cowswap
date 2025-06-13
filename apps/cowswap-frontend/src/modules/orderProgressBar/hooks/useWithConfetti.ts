import { useEffect, useState } from 'react'

import type { SurplusData } from 'common/hooks/useGetSurplusFiatValue'

interface WithConfettiParams {
  isFinished: boolean
  surplusData: SurplusData | undefined
  debugForceShowSurplus?: boolean
}

export function useWithConfetti({ isFinished, surplusData, debugForceShowSurplus }: WithConfettiParams): boolean {
  const { showSurplus } = surplusData || {}
  const shouldShowSurplus = debugForceShowSurplus || showSurplus
  const [showConfetti, setShowConfetti] = useState(Boolean(isFinished && shouldShowSurplus))

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined

    if (isFinished && shouldShowSurplus) {
      setShowConfetti(true)
      timer = setTimeout(() => setShowConfetti(false), 3000)
    }

    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [isFinished, shouldShowSurplus])

  return showConfetti
}
