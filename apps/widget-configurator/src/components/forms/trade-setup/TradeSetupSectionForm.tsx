import type { ReactNode } from 'react'
import { useCallback, useMemo } from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'
import { useAvailableChains } from '@cowprotocol/common-hooks'
import { isChainDeprecated, isSolanaChain, type SupportedChainId } from '@cowprotocol/cow-sdk'
import { TradeType } from '@cowprotocol/widget-lib'

import { TRADE_MODES_OPTIONS, TRADE_TYPE_OPTIONS } from '../../../configurator.constants'
import {
  getSolanaBlockedReason,
  getSolanaFeeNotice,
  isSolanaSelectable,
  isTradeTypeAvailableOnChain,
} from '../../../configurator.utils'
import { MultiSelectInput } from '../../ui/inputs/Select/multi/MultiSelectInput.component'
import { SelectInput } from '../../ui/inputs/Select/single/SelectInput.component'
import { SwitchInput } from '../../ui/inputs/SwitchInput/SwitchInput'

import type { SelectInputOption } from '../../ui/inputs/Select/base/BaseSelectInput.types'
import type { SidebarSectionFormProps } from '../forms.types'

export function TradeSetupSectionForm({ values, onChange }: SidebarSectionFormProps): ReactNode {
  const availableChains = useAvailableChains({ excludeSolana: !isSolanaSelectable(values) })
  const solanaBlockedReason = getSolanaBlockedReason(values)
  const solanaHelperText = solanaBlockedReason ?? getSolanaFeeNotice(values)

  const tradeTypeOptions = useMemo(() => withChainAvailability(TRADE_TYPE_OPTIONS, values.chainId), [values.chainId])
  const tradeModesOptions = useMemo(() => withChainAvailability(TRADE_MODES_OPTIONS, values.chainId), [values.chainId])

  // Moving to a chain that cannot run the selected trade type would hand the widget a tab it renders
  // disabled, so the selection follows the chain.
  const handleChainChange = useCallback(
    (_name: string, chainId: SupportedChainId): void => {
      onChange('chainId', chainId)

      if (!isTradeTypeAvailableOnChain(values.currentTradeType, chainId)) {
        onChange('currentTradeType', TradeType.SWAP)
      }
    },
    [onChange, values.currentTradeType],
  )

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
        options={tradeModesOptions}
        onChange={onChange}
      />

      <SelectInput
        name="currentTradeType"
        label="Current trade type"
        value={values.currentTradeType}
        options={tradeTypeOptions}
        onChange={onChange}
      />

      <SelectInput
        name="chainId"
        label="Network"
        value={values.chainId}
        options={chainOptions}
        onChange={handleChainChange}
      />

      <SwitchInput
        checked={!values.disableCrossChainSwap}
        label="Allow cross-chain swaps"
        onChange={(enabled) => onChange('disableCrossChainSwap', !enabled)}
      />

      <SwitchInput
        checked={values.enableSolana}
        disabled={!!solanaBlockedReason}
        label="Enable Solana"
        helperText={solanaHelperText}
        onChange={(enabled) => onChange('enableSolana', enabled)}
      />
    </>
  )
}

function withChainAvailability(
  options: SelectInputOption<TradeType>[],
  chainId: SupportedChainId,
): SelectInputOption<TradeType>[] {
  if (!isSolanaChain(chainId)) return options

  return options.map((option) => ({
    ...option,
    disabled: !isTradeTypeAvailableOnChain(option.value, chainId),
  }))
}
