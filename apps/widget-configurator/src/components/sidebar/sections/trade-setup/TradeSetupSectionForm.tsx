import type { Dispatch, ReactNode, SetStateAction } from 'react'

import { useAvailableChains } from '@cowprotocol/common-hooks'
import type { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { TradeType } from '@cowprotocol/widget-lib'

import { IS_IFRAME } from '../../../../configurator.constants'
import { BooleanSwitchControl } from '../../../ui/controls/BooleanSwitch/BooleanSwitchControl'
import { CurrentTradeTypeControl } from '../../../ui/controls/Select/CurrentTradeTypeControl'
import {
  NetworkControl,
  type NetworkOption,
  getNetworkOption,
  NetworkOptions,
} from '../../../ui/controls/Select/NetworkControl'
import { TradeModesControl } from '../../../ui/controls/Select/TradeModesControl'

import type { ConfiguratorFormChangeHandler, ConfiguratorFormValues } from '../section.types'

interface TradeSetupSectionFormProps {
  values: ConfiguratorFormValues
  onChange: ConfiguratorFormChangeHandler
}

function resolveNextState<T>(current: T, next: SetStateAction<T>): T {
  return typeof next === 'function' ? (next as (prevState: T) => T)(current) : next
}

export function TradeSetupSectionForm({ values, onChange }: TradeSetupSectionFormProps): ReactNode {
  const availableChains = useAvailableChains()
  const standaloneMode = values.widgetMode === 'standalone'

  const tradeModesState: [TradeType[], Dispatch<SetStateAction<TradeType[]>>] = [
    values.enabledTradeTypes,
    (nextValue) => onChange('enabledTradeTypes', resolveNextState(values.enabledTradeTypes, nextValue)),
  ]

  const tradeTypeState: [TradeType, Dispatch<SetStateAction<TradeType>>] = [
    values.currentTradeType,
    (nextValue) => onChange('currentTradeType', resolveNextState(values.currentTradeType, nextValue)),
  ]

  const selectedNetwork = getNetworkOption(values.chainId) || NetworkOptions[0]
  const networkState: [NetworkOption, Dispatch<SetStateAction<NetworkOption>>] = [
    selectedNetwork,
    (nextValue) => {
      const nextOption = resolveNextState(selectedNetwork, nextValue)
      onChange('chainId', nextOption.chainId as SupportedChainId)
    },
  ]

  return (
    <>
      <TradeModesControl state={tradeModesState} />
      <CurrentTradeTypeControl state={tradeTypeState} />
      {!IS_IFRAME ? (
        <NetworkControl state={networkState} standaloneMode={standaloneMode} availableChains={availableChains} />
      ) : null}
      <BooleanSwitchControl
        checked={!values.disableCrossChainSwap}
        label="Allow cross-chain swaps"
        onChange={(enabled) => onChange('disableCrossChainSwap', !enabled)}
      />
    </>
  )
}
