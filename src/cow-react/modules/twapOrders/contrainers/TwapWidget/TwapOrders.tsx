import { useGnosisSafeInfo } from '@cow/modules/wallet'
import { useEffect, useState } from 'react'
import { TwapOrder, useGetTwapOrders } from './hooks'
import { TwapOrderRow } from './TwapOrderRow'

export function TwapOrders() {
  const getTwapOrders = useGetTwapOrders()
  const gnosisSafeInfo = useGnosisSafeInfo()
  const [orders, setOrders] = useState<TwapOrder[] | null>(null)
  const safeAddress = gnosisSafeInfo?.address

  useEffect(() => {
    if (!safeAddress) {
      return
    }

    try {
      console.log('[Twap] getOrders for safe', safeAddress)
      getTwapOrders(safeAddress) // '0xD0306D218D45f5eCC9114dc45Df48d8C18aB3291'
        .then((twapOrders) => {
          console.log('[Twap] Set orders', twapOrders)
          setOrders(twapOrders || [])
        })
    } catch (error) {
      console.error('Error getting TWAP orders', error)
    }
  }, [safeAddress, getTwapOrders])

  if (!gnosisSafeInfo) {
    return null
  }

  const { fallbackHandler, nonce, owners, threshold } = gnosisSafeInfo
  console.log('[Twap] Loaded safe', { safeAddress, nonce, owners, threshold })
  console.log('[Twap] Current fallbackHandler', fallbackHandler)

  if (orders === null) {
    return <>Loading...</>
  }

  if (orders.length === 0) {
    return <>No TWAP orders yet!</>
  }

  return (
    <div>
      {orders.map((order, index) => (
        <TwapOrderRow key={index} order={order} />
      ))}
    </div>
  )
}
