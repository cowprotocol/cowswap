import React from 'react'
import SlippageTabsMod, { SlippageTabsProps as SlippageTabsPropsMod } from './TransactionSetttingsMod'

import { unstable_batchedUpdates as batchedUpdates } from 'react-dom'

type SetRawSlippage = (rawSlippage: number) => void
type SetSlippageInput = (value: React.SetStateAction<string>) => void

function parseCustomSlippage(value: string, setRawSlippage: SetRawSlippage, setSlippageInput: SetSlippageInput): void {
  // we don't allow negative slippage to be input
  if (isNaN(Number(value)) || Number(value) < 0) {
    return batchedUpdates(() => {
      setSlippageInput('0')
      setRawSlippage(0)
    })
  }

  setSlippageInput(value)

  try {
    const valueAsIntFromRoundedFloat = Number.parseInt((Number.parseFloat(value) * 100).toString())
    if (!Number.isNaN(valueAsIntFromRoundedFloat) && valueAsIntFromRoundedFloat < 5000) {
      setRawSlippage(valueAsIntFromRoundedFloat)
    }
  } catch {}
}

export type ParseCustomSlippageFn = typeof parseCustomSlippage
export type SlippageTabsProps = Omit<SlippageTabsPropsMod, 'parseCustomSlippageFn'>

export default function SlippageTabs(params: SlippageTabsProps) {
  return <SlippageTabsMod {...params} parseCustomSlippageFn={parseCustomSlippage} />
}
