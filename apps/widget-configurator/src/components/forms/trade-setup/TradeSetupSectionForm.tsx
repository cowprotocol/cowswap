import type { ReactNode } from 'react'
import { useMemo } from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'
import { useAvailableChains } from '@cowprotocol/common-hooks'
import { isChainDeprecated, type SupportedChainId } from '@cowprotocol/cow-sdk'

import { HostSolanaWalletControl } from './HostSolanaWalletControl'

import { TRADE_MODES_OPTIONS, TRADE_TYPE_OPTIONS } from '../../../configurator.constants'
import { getSolanaDappModeNotice, getSolanaFeeNotice, isSolanaSelectable } from '../../../configurator.utils'
import { useHostSolanaWallet } from '../../../hooks/useHostSolanaWallet'
import { MultiSelectInput } from '../../ui/inputs/Select/multi/MultiSelectInput.component'
import { SelectInput } from '../../ui/inputs/Select/single/SelectInput.component'
import { SwitchInput } from '../../ui/inputs/SwitchInput/SwitchInput'

import type { SelectInputOption } from '../../ui/inputs/Select/base/BaseSelectInput.types'
import type { SidebarSectionFormProps } from '../forms.types'

export function TradeSetupSectionForm({ values, onChange }: SidebarSectionFormProps): ReactNode {
  const { solanaProvider } = useHostSolanaWallet()
  const isDappMode = values.widgetMode !== 'standalone'
  const availableChains = useAvailableChains({ excludeSolana: !isSolanaSelectable(values, !!solanaProvider) })
  const solanaHelperText = getSolanaDappModeNotice(values, !!solanaProvider) ?? getSolanaFeeNotice(values)

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
      <MultiSelectInput
        name="enabledTradeTypes"
        label="Trade types"
        value={values.enabledTradeTypes}
        options={TRADE_MODES_OPTIONS}
        onChange={onChange}
      />

      <SelectInput
        name="currentTradeType"
        label="Current trade type"
        value={values.currentTradeType}
        options={TRADE_TYPE_OPTIONS}
        onChange={onChange}
      />

      <SelectInput name="chainId" label="Network" value={values.chainId} options={chainOptions} onChange={onChange} />

      <SwitchInput
        checked={!values.disableCrossChainSwap}
        label="Allow cross-chain swaps"
        onChange={(enabled) => onChange('disableCrossChainSwap', !enabled)}
      />

      <SwitchInput
        checked={values.enableSolana}
        label="Enable Solana"
        helperText={solanaHelperText}
        onChange={(enabled) => onChange('enableSolana', enabled)}
      />

      {values.enableSolana && isDappMode ? <HostSolanaWalletControl /> : null}
    </>
  )
}
