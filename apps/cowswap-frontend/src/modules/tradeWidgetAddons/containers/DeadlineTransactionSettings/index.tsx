import { JSX } from 'react'

import { DEFAULT_DEADLINE_FROM_NOW } from '@cowprotocol/common-const'
import { StatefulValue } from '@cowprotocol/types'
import { HelpTooltip, RowFixed } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import { ThemedText } from 'theme'

import { useIsEoaEthFlow } from 'modules/trade'

import { getNativeOrderDeadlineTooltip, getNonNativeOrderDeadlineTooltip } from 'common/utils/tradeSettingsTooltips'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'

import { useCustomDeadline } from './hooks/useCustomDeadline'
import * as styledEl from './styled'

interface DeadlineSettingsProps {
  deadlineState: StatefulValue<number>
}

export function DeadlineTransactionSettings({ deadlineState }: DeadlineSettingsProps): JSX.Element {
  const { viewValue, parseCustomDeadline, error, isDisabled, onBlur } = useCustomDeadline(deadlineState)
  const nativeCurrency = useNativeCurrency()
  const isEoaEthFlow = useIsEoaEthFlow()

  return (
    <>
      <RowFixed>
        <ThemedText.Black fontSize={14} fontWeight={400}>
          <Trans>Swap deadline</Trans>
        </ThemedText.Black>
        <HelpTooltip
          text={
            isEoaEthFlow ? getNativeOrderDeadlineTooltip([nativeCurrency.symbol]) : getNonNativeOrderDeadlineTooltip()
          }
        />
      </RowFixed>
      <RowFixed>
        <styledEl.OptionCustom style={{ width: '80px' }} warning={!!error} tabIndex={-1}>
          <styledEl.Input
            placeholder={(DEFAULT_DEADLINE_FROM_NOW / 60).toString()}
            value={viewValue}
            onChange={(e) => parseCustomDeadline(e.target.value)}
            onBlur={onBlur}
            color={error ? 'red' : ''}
            disabled={isDisabled}
          />
        </styledEl.OptionCustom>
        <ThemedText.Body style={{ paddingLeft: '8px' }} fontSize={14}>
          <Trans>minutes</Trans>
        </ThemedText.Body>
      </RowFixed>
    </>
  )
}
