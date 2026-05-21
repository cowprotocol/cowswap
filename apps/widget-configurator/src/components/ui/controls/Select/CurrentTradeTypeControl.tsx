import type { Dispatch, ReactNode, SetStateAction } from 'react'

import type { TradeType } from '@cowprotocol/widget-lib'

import { SelectInput } from './SelectInput'

import { TRADE_MODES } from '../../../../configurator.constants'

const LABEL = 'Current trade type'

export interface CurrentTradeTypeControlProps {
  state: [TradeType, Dispatch<SetStateAction<TradeType>>]
}

export function CurrentTradeTypeControl({ state }: CurrentTradeTypeControlProps): ReactNode {
  const [tradeType, setTradeType] = state

  return (
    <SelectInput
      id="select-trade-type"
      name="currentTradeType"
      label={LABEL}
      value={tradeType}
      options={TRADE_MODES.map((option) => ({ label: option, value: option }))}
      onChange={(_, value) => {
        if (value === '' || Array.isArray(value)) return
        setTradeType(value as TradeType)
      }}
    />
  )
}
