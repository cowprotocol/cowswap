import { useGnosisSafeInfo } from '@cow/modules/wallet'
import styled from 'styled-components/macro'
import { useEffect, useState } from 'react'
import { TwapOrder, useGetTwapOrders } from './hooks'
import { TwapOrderRow } from './TwapOrderRow'

const ErrorMessage = styled.span`
  color: red;
`

export function TwapOrders() {
  const getTwapOrders = useGetTwapOrders()
  const gnosisSafeInfo = useGnosisSafeInfo()
  const [orders, setOrders] = useState<TwapOrder[]>([])
  const safeAddress = gnosisSafeInfo?.address

  useEffect(() => {
    if (!safeAddress) {
      return
    }

    try {
      console.log('[Twap] getOrders for safe', safeAddress)
      getTwapOrders('0xD0306D218D45f5eCC9114dc45Df48d8C18aB3291') // safeAddress
        .then((twapOrders) => {
          console.log('[Twap] Set orders', twapOrders)
          setOrders(twapOrders || [])
        })
    } catch (error) {
      console.error('Error getting TWAP orders', error)
    }
  }, [safeAddress, getTwapOrders])

  if (!gnosisSafeInfo) {
    return (
      <div>
        <ErrorMessage>Please connect a Gnosis Safe to create a TWAP Order</ErrorMessage>
      </div>
    )
  }

  const { fallbackHandler, nonce, owners, threshold } = gnosisSafeInfo
  console.log('[Twap] Loaded safe', { safeAddress, nonce, owners, threshold })
  console.log('[Twap] Current fallbackHandler', fallbackHandler)

  return (
    <div>
      {/* 
      <div>
        <strong>Connected Safe:</strong> {safeAddress}
      </div> 
      */}

      {orders.length > 0 && orders.map((order, index) => <TwapOrderRow key={index} order={order} />)}
    </div>
  )
}
