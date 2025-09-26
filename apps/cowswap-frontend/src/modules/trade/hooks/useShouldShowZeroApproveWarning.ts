import { useEffect, useState } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useShouldZeroApprove } from 'modules/zeroApproval'

export function useShouldShowZeroApproveWarning(amountToApprove: CurrencyAmount<Currency> | undefined): boolean {
  const [showZeroApproveWarning, setShowZeroApproveWarning] = useState(false)
  const shouldZeroApprove = useShouldZeroApprove(amountToApprove)

  useEffect(() => {
    let cancelled = false

    if (!amountToApprove) {
      setShowZeroApproveWarning(false)
      return
    }

    shouldZeroApprove()
      .then((result) => {
        if (!cancelled) {
          setShowZeroApproveWarning(!!result)
        }
      })
      .catch((_) => {
        if (!cancelled) {
          setShowZeroApproveWarning(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [shouldZeroApprove, amountToApprove])

  return showZeroApproveWarning
}
