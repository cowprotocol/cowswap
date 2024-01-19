import { useEffect, useLayoutEffect, useRef } from 'react'

import { useSpring } from '@react-spring/web'

import {
  TRADE_WIDGET_ANIMATION_CONFIG,
  CURRENT_WIDGET_OPENING,
  CURRENT_WIDGET_CLOSING,
  NEXT_WIDGET_CLOSING,
  NEXT_WIDGET_OPENING,
} from './animationConfigs'

export function useTradeWidgetAnimation(isNextWidgetOpen: boolean) {
  const isWidgetInited = useRef(false)

  const currentWidgetAnimation = useSpring(() => ({
    from: CURRENT_WIDGET_CLOSING.from,
    config: TRADE_WIDGET_ANIMATION_CONFIG,
  }))

  const nextWidgetAnimation = useSpring(() => ({
    from: NEXT_WIDGET_OPENING.from,
    config: TRADE_WIDGET_ANIMATION_CONFIG,
  }))

  const currentWidgetSpringsApi = currentWidgetAnimation[1]
  const nextWidgetSpringsApi = nextWidgetAnimation[1]

  // Prevent animation on first render
  useEffect(() => {
    setTimeout(() => {
      isWidgetInited.current = true
    }, 500)
  }, [])

  useLayoutEffect(() => {
    if (!isWidgetInited.current) {
      return
    }

    if (isNextWidgetOpen) {
      currentWidgetSpringsApi.start(CURRENT_WIDGET_CLOSING)
      nextWidgetSpringsApi.start(NEXT_WIDGET_OPENING)
    } else {
      currentWidgetSpringsApi.start(CURRENT_WIDGET_OPENING)
      nextWidgetSpringsApi.start(NEXT_WIDGET_CLOSING)
    }
  }, [isNextWidgetOpen, currentWidgetSpringsApi, nextWidgetSpringsApi])

  return {
    currentWidgetAnimation,
    nextWidgetAnimation,
  }
}
