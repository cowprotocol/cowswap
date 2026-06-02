import type { ReactNode } from 'react'
import { useMemo } from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'
import { useAvailableChains } from '@cowprotocol/common-hooks'
import { isChainDeprecated, type SupportedChainId } from '@cowprotocol/cow-sdk'

import { IS_IFRAME, TRADE_MODES_OPTIONS, TRADE_TYPE_OPTIONS } from '../../../../configurator.constants'
import { SelectInput, SelectInputOption } from '../../../ui/controls/Select/SelectInput'
import { SwitchInput } from '../../../ui/controls/SwitchInput/SwitchInput'

import type { ConfiguratorFormChangeHandler, ConfiguratorFormValues } from '../section.types'

interface TradeSetupSectionFormProps {
  values: ConfiguratorFormValues
  onChange: ConfiguratorFormChangeHandler
}

export function TradeSetupSectionForm({ values, onChange }: TradeSetupSectionFormProps): ReactNode {
  const availableChains = useAvailableChains()

  const chainOptions: SelectInputOption<SupportedChainId>[] = useMemo(() => {
    const availableChainsSet = new Set(availableChains)

    const chainOptions: SelectInputOption<SupportedChainId>[] = Object.entries(CHAIN_INFO).map(
      ([chainIdStr, chainInfo]) => {
        const chainId = +chainIdStr as SupportedChainId

        return {
          value: chainId,
          label: `${chainInfo.label}${isChainDeprecated(chainId) ? ' (deprecated)' : ''}`,
          disabled: !availableChainsSet.has(chainId),
        }
      },
    )

    return chainOptions
  }, [availableChains])

  return (
    <>
      <SelectInput
        id="trade-mode-select"
        name="enabledTradeTypes"
        label="Trade types"
        multiple
        value={values.enabledTradeTypes}
        options={TRADE_MODES_OPTIONS}
        onChange={onChange}
        renderValue={(selected) => (Array.isArray(selected) ? selected.join(', ') : selected)}
      />

      <SelectInput
        id="select-trade-type"
        name="currentTradeType"
        label="Current trade type"
        value={values.currentTradeType}
        options={TRADE_TYPE_OPTIONS}
        onChange={onChange}
      />

      <SelectInput
        id="controllable-states-network"
        name="chainId"
        label="Network"
        value={values.chainId}
        disabled={values.widgetMode === 'standalone' || IS_IFRAME}
        options={chainOptions}
        onChange={onChange}
      />

      <SwitchInput
        checked={!values.disableCrossChainSwap}
        label="Allow cross-chain swaps"
        onChange={(enabled) => onChange('disableCrossChainSwap', !enabled)}
      />
    </>
  )
}
