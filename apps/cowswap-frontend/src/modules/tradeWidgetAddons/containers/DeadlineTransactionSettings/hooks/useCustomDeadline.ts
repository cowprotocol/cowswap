import { useCallback, useEffect, useMemo, useState } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { DEFAULT_DEADLINE_FROM_NOW } from '@cowprotocol/common-const'
import { clampValue, isValidIntegerFactory } from '@cowprotocol/common-utils'
import { StatefulValue } from '@cowprotocol/types'
import { useIsSmartContractWallet } from '@cowprotocol/wallet'
import { TradeType } from '@cowprotocol/widget-lib'

import { useInjectedWidgetDeadline } from 'modules/injectedWidget'
import { useIsEoaEthFlow } from 'modules/trade'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'

import { deadlineToView, getDeadlineRange } from '../utils'

type TxSettingAction = 'Default' | 'Custom'

enum DeadlineError {
  InvalidInput = 'InvalidInput',
}

interface DeadlineAnalyticsEvent {
  category: CowSwapAnalyticsCategory.TRADE
  action: `${TxSettingAction} Order Expiration Time`
  value: number
}

export function useCustomDeadline(deadlineState: StatefulValue<number>): {
  isDisabled: boolean
  onBlur: () => void
  error: DeadlineError | false
  viewValue: string
  parseCustomDeadline: (value: string) => void
} {
  const [deadlineInput, setDeadlineInput] = useState('')
  const [deadlineError, setDeadlineError] = useState<DeadlineError | false>(false)

  const [deadline, setDeadline] = deadlineState
  const widgetDeadline = useInjectedWidgetDeadline(TradeType.SWAP)

  const isSmartContractWallet = useIsSmartContractWallet()
  const isEoaEthFlow = useIsEoaEthFlow()
  const analytics = useCowAnalytics()

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

  const [minDeadline, maxDeadline] = useMemo(
    () => getDeadlineRange(isEoaEthFlow, !!isSmartContractWallet),
    [isEoaEthFlow, isSmartContractWallet],
  )

  useEffect(() => {
    if (widgetDeadline) {
      // Deadline is stored in seconds
      const value = Math.floor(widgetDeadline) * 60
      setDeadline(clampValue(value, minDeadline, maxDeadline))
    }
  }, [widgetDeadline, minDeadline, maxDeadline, setDeadline])

  const isDeadlineDisabled = !!widgetDeadline

  const parseCustomDeadline = useCallback(
    (value: string) => {
      // populate what the user typed and clear the error
      setDeadlineInput(value)
      setDeadlineError(false)
      const isValidInput = isValidIntegerFactory(minDeadline, maxDeadline)

      if (value.length === 0) {
        sendDeadlineAnalytics('Default', DEFAULT_DEADLINE_FROM_NOW)
        setDeadline(DEFAULT_DEADLINE_FROM_NOW)
      } else {
        try {
          const parsed: number = Math.floor(Number.parseFloat(value) * 60)
          if (isValidInput(parsed)) {
            sendDeadlineAnalytics('Custom', parsed)
            setDeadline(parsed)
          } else {
            setDeadlineError(DeadlineError.InvalidInput)
          }
        } catch (error) {
          console.error(error)
          setDeadlineError(DeadlineError.InvalidInput)
        }
      }
    },
    [minDeadline, maxDeadline, setDeadline, sendDeadlineAnalytics],
  )

  const onBlur = useCallback(() => {
    setDeadlineInput('')
    setDeadlineError(false)
  }, [setDeadlineInput, setDeadlineError])

  const viewValue = deadlineToView(deadlineInput, deadline)

  return {
    isDisabled: isDeadlineDisabled,
    onBlur,
    error: deadlineError,
    viewValue,
    parseCustomDeadline,
  }
}
