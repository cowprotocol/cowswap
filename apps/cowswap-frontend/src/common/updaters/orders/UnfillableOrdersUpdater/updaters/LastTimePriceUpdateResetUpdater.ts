import { useAtom } from 'jotai'
import { useEffect } from 'react'

import ms from 'ms.macro'

import { orderLastTimePriceUpdateAtom } from '../state/orderLastTimePriceUpdateAtom'

const RECORD_EXPIRATION = ms`1d`

export function LastTimePriceUpdateResetUpdater(): null {
  const [orderLastTimePriceUpdate, setOrderLastTimePriceUpdate] = useAtom(orderLastTimePriceUpdateAtom)

  useEffect(() => {
    const now = Date.now()

    const keysToDelete = Object.keys(orderLastTimePriceUpdate).filter((key) => {
      const lastUpdate = orderLastTimePriceUpdate[key]

      if (typeof lastUpdate !== 'number') return true

      return now - lastUpdate >= RECORD_EXPIRATION
    })

    if (keysToDelete.length > 0) {
      const stateCopy = { ...orderLastTimePriceUpdate }

      keysToDelete.forEach((key) => {
        delete stateCopy[key]
      })

      console.debug(`[LastTimePriceUpdateResetUpdater] removed ${keysToDelete.length} records.`)
      setOrderLastTimePriceUpdate(stateCopy)
    }
    // Run only once at page load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
