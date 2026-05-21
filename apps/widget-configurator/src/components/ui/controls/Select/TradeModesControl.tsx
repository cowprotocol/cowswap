import { Dispatch, ReactNode, SetStateAction } from 'react'

import { TradeType } from '@cowprotocol/widget-lib'

import { SelectInput } from './SelectInput'

const LABEL = 'Trade types'

export function TradeModesControl({
  state,
}: {
  state: [TradeType[], Dispatch<SetStateAction<TradeType[]>>]
}): ReactNode {
  const [tradeModes, setTradeModes] = state

  const handleTradeModeChange = (_: string, value: TradeType[] | '' | TradeType): void => {
    const nextTradeModes = Array.isArray(value) ? value : []
    if (!nextTradeModes.length) return

    setTradeModes(nextTradeModes)
  }

  return (
    <SelectInput
      id="trade-mode-select"
      name="enabledTradeTypes"
      label={LABEL}
      multiple
      value={tradeModes}
      options={Object.values(TradeType).map((option) => ({ label: option, value: option }))}
      onChange={handleTradeModeChange}
      renderValue={(selected) => (Array.isArray(selected) ? selected.join(', ') : selected)}
    />
  )
}
