import React from 'react'
import { LimitOrdersWidget } from 'cow-react/modules/limitOrders/containers/LimitOrdersWidget'
import { QuoteResolver } from 'cow-react/modules/limitOrders/containers/QuoteResolver'

export default function LimitOrderPage() {
  return (
    <>
      <QuoteResolver />
      <LimitOrdersWidget />
    </>
  )
}
