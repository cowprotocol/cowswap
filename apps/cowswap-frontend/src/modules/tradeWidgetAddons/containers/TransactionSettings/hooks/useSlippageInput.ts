import { useCallback, useRef, useState } from 'react'
import { CowSwapAnalyticsCategory } from '../../../../../common/analytics/types'
import { isValidInteger, percentToBps } from '@cowprotocol/common-utils'
import { MAX_SLIPPAGE_BPS, MIN_SLIPPAGE_BPS } from '@cowprotocol/common-const'
import { Percent } from '@uniswap/sdk-core'
import { StatefulValue } from '@cowprotocol/types'
import { useCowAnalytics } from '@cowprotocol/analytics'
import {
  useDefaultTradeSlippage,
  useIsSlippageModified,
  useSetSlippage,
  useTradeSlippage
} from '../../../../tradeSlippage'
import { useIsEoaEthFlow } from '../../../../trade'
import { useMinEthFlowSlippage } from './useMinEthFlowSlippage'
import { useOnClickOutside } from '@cowprotocol/common-hooks'

enum SlippageError {
  InvalidInput = 'InvalidInput',
}

type TxSettingAction = 'Default' | 'Custom'

interface SlippageAnalyticsEvent {
  category: CowSwapAnalyticsCategory.TRADE
  action: `${TxSettingAction} Slippage Tolerance`
  value: number
}

export function useSlippageInput(): {
  slippageViewValue: string
  slippageError: SlippageError | false
  parseSlippageInput: (value: string) => void
  placeholderSlippage: Percent
  onSlippageInputBlur: () => void
  setAutoSlippage: () => void
} {
  const [slippageInput, setSlippageInput] = useState('')
  const [slippageError, setSlippageError] = useState<SlippageError | false>(false)

  const setSwapSlippage = useSetSlippage()

  const isEoaEthFlow = useIsEoaEthFlow()
  const analytics = useCowAnalytics()

  const defaultSwapSlippage = useDefaultTradeSlippage()
  const swapSlippage = useTradeSlippage()
  const isSlippageModified = useIsSlippageModified()

  const placeholderSlippage = isSlippageModified ? defaultSwapSlippage : swapSlippage

  const sendSlippageAnalytics = useCallback(
    (action: TxSettingAction, value: string | number) => {
      const analyticsEvent: SlippageAnalyticsEvent = {
        category: CowSwapAnalyticsCategory.TRADE,
        action: `${action} Slippage Tolerance`,
        value: typeof value === 'string' ? parseFloat(value) : value,
      }
      analytics.sendEvent(analyticsEvent)
    },
    [analytics],
  )

  const slippageViewValue = slippageInput.length > 0
    ? slippageInput
    : (!isSlippageModified ? '' : swapSlippage.toFixed(2))

  const { minEthFlowSlippageBps } = useMinEthFlowSlippage();

  const parseSlippageInput = useCallback(
    (value: string) => {
      // populate what the user typed and clear the error
      setSlippageInput(value)
      setSlippageError(false)

      if (value.length === 0) {
        sendSlippageAnalytics('Default', placeholderSlippage.toFixed(2))
        setSwapSlippage(null)
      } else {
        let v = value

        // Prevent inserting more than 2 decimal precision
        if (value.split('.')[1]?.length > 2) {
          // indexOf + 3 because we are cutting it off at `.XX`
          v = value.slice(0, value.indexOf('.') + 3)
          // Update the input to remove the extra numbers from UI input
          setSlippageInput(v)
        }

        const parsed = Math.round(Number.parseFloat(v) * 100)
        const isValidInput = isValidInteger(
          isEoaEthFlow ? minEthFlowSlippageBps : MIN_SLIPPAGE_BPS,
          MAX_SLIPPAGE_BPS,
        )

        if (!isValidInput(parsed)) {
          if (v !== '.') {
            setSlippageError(SlippageError.InvalidInput)
          }
        }

        sendSlippageAnalytics('Custom', parsed)
        setSwapSlippage(percentToBps(new Percent(parsed, 10_000)))
      }
    },
    [
      placeholderSlippage,
      isEoaEthFlow,
      minEthFlowSlippageBps,
      setSwapSlippage,
      sendSlippageAnalytics,
    ],
  )

  const onSlippageInputBlur = useCallback(() => {
    if (slippageError) {
      sendSlippageAnalytics('Default', placeholderSlippage.toFixed(2))
      setSwapSlippage(null)
      setSlippageError(false)
    }

    setSlippageInput('')
  }, [slippageError, placeholderSlippage, setSwapSlippage, sendSlippageAnalytics])

  const wrapperRef = useRef(null)

  useOnClickOutside([wrapperRef], onSlippageInputBlur)

  const setAutoSlippage = useCallback(() => {
    setSwapSlippage(null)
  }, [setSwapSlippage])

  return {
    slippageError,
    parseSlippageInput,
    placeholderSlippage,
    slippageViewValue,
    onSlippageInputBlur,
    setAutoSlippage
  }
}
