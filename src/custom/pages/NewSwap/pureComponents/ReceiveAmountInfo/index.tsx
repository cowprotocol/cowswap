import React from 'react'
import * as styledEl from './styled'

export function ReceiveAmountInfo() {
  return (
    <styledEl.Box>
      <div>
        <span>Before fee</span>
        <span>0.9999 USDC</span>
      </div>
      <div>
        <span>Fee</span>
        <span>-0.9 USDC</span>
      </div>
      <div>
        <span>Gas cost</span>
        <styledEl.GasCost>Free</styledEl.GasCost>
      </div>
      <styledEl.TotalAmount>
        <span>To</span>
        <span>0.9999 USDC</span>
      </styledEl.TotalAmount>
    </styledEl.Box>
  )
}
