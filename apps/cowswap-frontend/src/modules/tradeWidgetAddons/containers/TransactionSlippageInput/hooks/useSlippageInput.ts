import { RefObject, useCallback, useMemo, useRef, useState } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { useOnClickOutside } from '@cowprotocol/common-hooks'
import { isValidIntegerFactory, percentToBps } from '@cowprotocol/common-utils'
import { Percent } from '@uniswap/sdk-core'

import {
  useDefaultTradeSlippage,
  useIsSlippageModified,
  useSetSlippage,
  useSlippageConfig,
  useTradeSlippage,
} from 'modules/tradeSlippage'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'

enum SlippageError {
  InvalidInput = 'InvalidInput',
}

type TxSettingAction = 'Default' | 'Custom'

interface SlippageAnalyticsEvent {
  category: CowSwapAnalyticsCategory.TRADE
  action: `${TxSettingAction} Slippage Tolerance`
  value: number
}

interface ReturnType {
  slippageViewValue: string
  slippageError: SlippageError | false
  isInputFocused: boolean
  parseSlippageInput: (value: string) => void
  placeholderSlippage: Percent
  onSlippageInputBlur: () => void
  setAutoSlippage: () => void
  inputRef: RefObject<HTMLInputElement | null>
  focusOnInput: () => void
}

function getSlippageForView(slippageInput: string, isSlippageModified: boolean, swapSlippage: Percent): string {
  return slippageInput.length > 0 ? slippageInput : !isSlippageModified ? '' : swapSlippage.toFixed(2)
}

// eslint-disable-next-line max-lines-per-function
export function useSlippageInput(): ReturnType {
  const inputRef = useRef<HTMLInputElement>(null)
  const [slippageInput, setSlippageInput] = useState('')
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [slippageError, setSlippageError] = useState<SlippageError | false>(false)

  const { min, max } = useSlippageConfig()

  const setSwapSlippage = useSetSlippage()
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

  const slippageViewValue = getSlippageForView(slippageInput, isSlippageModified, swapSlippage)

  const isValidInput = useMemo(() => {
    return isValidIntegerFactory(min, max)
  }, [min, max])

  const parseSlippageInput = useCallback(
    (value: string) => {
      setIsInputFocused(true)
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
        if (!isValidInput(parsed)) {
          if (v !== '.') {
            setSlippageError(SlippageError.InvalidInput)
          }
        }

        sendSlippageAnalytics('Custom', parsed)
        setSwapSlippage(percentToBps(new Percent(parsed, 10_000)))
      }
    },
    [placeholderSlippage, isValidInput, setSwapSlippage, sendSlippageAnalytics],
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
    setIsInputFocused(false)
  }, [setSwapSlippage])

  const focusOnInput = (): void => {
    setIsInputFocused(true)
    inputRef.current?.focus()
  }

  return {
    inputRef,
    slippageError,
    parseSlippageInput,
    isInputFocused,
    placeholderSlippage,
    slippageViewValue,
    onSlippageInputBlur,
    setAutoSlippage,
    focusOnInput,
  }
}
