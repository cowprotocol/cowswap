import { useCallback, useEffect, useState } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { DEFAULT_DEADLINE_FROM_NOW } from '@cowprotocol/common-const'
import { StatefulValue } from '@cowprotocol/types'
import { HelpTooltip, RowFixed } from '@cowprotocol/ui'
import { useIsSmartContractWallet } from '@cowprotocol/wallet'
import { TradeType } from '@cowprotocol/widget-lib'

import * as styledEl from '../TransactionSettings/styled'

import { Trans } from '@lingui/macro'

import { CowSwapAnalyticsCategory } from '../../../../common/analytics/types'
import {
  getNativeOrderDeadlineTooltip,
  getNonNativeOrderDeadlineTooltip,
} from '../../../../common/utils/tradeSettingsTooltips'
import useNativeCurrency from '../../../../lib/hooks/useNativeCurrency'
import { ThemedText } from '../../../../theme'
import { useInjectedWidgetDeadline } from '../../../injectedWidget'
import { useIsEoaEthFlow } from '../../../trade'
import { clampDeadline, deadlineToView, getDeadlineRange } from './utils'

type TxSettingAction = 'Default' | 'Custom'

enum DeadlineError {
  InvalidInput = 'InvalidInput',
}

interface TransactionSettingsProps {
  deadlineState: StatefulValue<number>
}

interface DeadlineAnalyticsEvent {
  category: CowSwapAnalyticsCategory.TRADE
  action: `${TxSettingAction} Order Expiration Time`
  value: number
}

export function DeadlineTransactionSettings({ deadlineState }: TransactionSettingsProps) {
  const [deadlineInput, setDeadlineInput] = useState('')
  const [deadlineError, setDeadlineError] = useState<DeadlineError | false>(false)

  const [deadline, setDeadline] = deadlineState
  const widgetDeadline = useInjectedWidgetDeadline(TradeType.SWAP)

  const isSmartContractWallet = useIsSmartContractWallet()
  const isEoaEthFlow = useIsEoaEthFlow()
  const analytics = useCowAnalytics()
  const nativeCurrency = useNativeCurrency()

  const sendDeadlineAnalytics = useCallback(
    (action: TxSettingAction, value: number) => {
      const analyticsEvent: DeadlineAnalyticsEvent = {
        category: CowSwapAnalyticsCategory.TRADE,
        action: `${action} Order Expiration Time`,
        value,
      }
      analytics.sendEvent(analyticsEvent)
    },
    [analytics],
  )

  const [minDeadline, maxDeadline] = getDeadlineRange(isEoaEthFlow, !!isSmartContractWallet)

  useEffect(() => {
    if (widgetDeadline) {
      // Deadline is stored in seconds
      const value = Math.floor(widgetDeadline) * 60
      setDeadline(clampDeadline(value, minDeadline, maxDeadline))
    }
  }, [widgetDeadline, minDeadline, maxDeadline, setDeadline])

  const isDeadlineDisabled = !!widgetDeadline

  const parseCustomDeadline = useCallback(
    (value: string) => {
      // populate what the user typed and clear the error
      setDeadlineInput(value)
      setDeadlineError(false)

      if (value.length === 0) {
        sendDeadlineAnalytics('Default', DEFAULT_DEADLINE_FROM_NOW)
        setDeadline(DEFAULT_DEADLINE_FROM_NOW)
      } else {
        try {
          const parsed: number = Math.floor(Number.parseFloat(value) * 60)
          if (
            !Number.isInteger(parsed) || // Check deadline is a number
            parsed < minDeadline || // Check deadline is not too small
            parsed > maxDeadline // Check deadline is not too big
          ) {
            setDeadlineError(DeadlineError.InvalidInput)
          } else {
            sendDeadlineAnalytics('Custom', parsed)
            setDeadline(parsed)
          }
          // TODO: Replace any with proper type definitions
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          console.error(error)
          setDeadlineError(DeadlineError.InvalidInput)
        }
      }
    },
    [minDeadline, maxDeadline, setDeadline, sendDeadlineAnalytics],
  )

  return (
    <>
      <RowFixed>
        <ThemedText.Black fontSize={14} fontWeight={400}>
          <Trans>Swap deadline</Trans>
        </ThemedText.Black>
        <HelpTooltip
          text={
            <Trans>
              {isEoaEthFlow
                ? getNativeOrderDeadlineTooltip([nativeCurrency.symbol])
                : getNonNativeOrderDeadlineTooltip()}
            </Trans>
          }
        />
      </RowFixed>
      <RowFixed>
        <styledEl.OptionCustom style={{ width: '80px' }} warning={!!deadlineError} tabIndex={-1}>
          <styledEl.Input
            placeholder={(DEFAULT_DEADLINE_FROM_NOW / 60).toString()}
            value={deadlineToView(deadlineInput, deadline)}
            onChange={(e) => parseCustomDeadline(e.target.value)}
            onBlur={() => {
              setDeadlineInput('')
              setDeadlineError(false)
            }}
            color={deadlineError ? 'red' : ''}
            disabled={isDeadlineDisabled}
          />
        </styledEl.OptionCustom>
        <ThemedText.Body style={{ paddingLeft: '8px' }} fontSize={14}>
          <Trans>minutes</Trans>
        </ThemedText.Body>
      </RowFixed>
    </>
  )
}
