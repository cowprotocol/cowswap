'use client'

import { type ReactNode, type RefObject, useEffect, useState } from 'react'

import styles from './TradeBarActions.module.css'

import { TRADE_SIDES } from '../config/tradeSides'
import { TRADE_WIDGET_ID, useJumpToTrade } from '../model/useSelectTradeToken'

import { trackEvent } from '@/shared/lib/analytics'
import { WALLET_BAR_HEIGHT, WalletBarSlot } from '@/widgets/header'

const MIN_VISIBLE_WIDGET_HEIGHT = 120

interface TradeBarActionsProps {
  ticker: string
  widgetRef: RefObject<HTMLElement | null>
}

export function TradeBarActions({ ticker, widgetRef }: TradeBarActionsProps): ReactNode {
  const jumpToTrade = useJumpToTrade()
  const isWidgetInView = useIsWidgetInView(widgetRef)

  return (
    <WalletBarSlot>
      <div className={styles.actions} inert={isWidgetInView}>
        {TRADE_SIDES.map(({ side, title }) => (
          <button
            key={side}
            type="button"
            className={side === 'buy' ? styles.buy : styles.sell}
            aria-label={`${title} ${ticker}`}
            aria-controls={TRADE_WIDGET_ID}
            onClick={() => {
              jumpToTrade(side)
              trackEvent('trade_side_select', { ticker, side, placement: 'wallet_bar' })
            }}
          >
            {title}
            <span className={styles.ticker}> {ticker}</span>
          </button>
        ))}
      </div>
    </WalletBarSlot>
  )
}

function useIsWidgetInView(widgetRef: RefObject<HTMLElement | null>): boolean {
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const widget = widgetRef.current
    if (!widget) return

    // Inset from each visible edge by the minimum height, so the widget meets both once that much of it shows. One
    // observer per edge, because a single band inset from both would invert on a viewport too short to hold them
    const rootMargins = [
      `-${MIN_VISIBLE_WIDGET_HEIGHT}px 0px 0px 0px`,
      `0px 0px -${WALLET_BAR_HEIGHT + MIN_VISIBLE_WIDGET_HEIGHT}px 0px`,
    ]
    const areIntersecting = rootMargins.map(() => false)
    const observers = rootMargins.map((rootMargin, index) => {
      const observer = new IntersectionObserver(
        (entries) => {
          areIntersecting[index] = entries.at(-1)?.isIntersecting ?? false
          setIsInView(areIntersecting.every(Boolean))
        },
        { rootMargin },
      )
      observer.observe(widget)

      return observer
    })

    return () => observers.forEach((observer) => observer.disconnect())
  }, [widgetRef])

  return isInView
}
