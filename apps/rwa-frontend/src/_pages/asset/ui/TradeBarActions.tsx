'use client'

import { type ReactNode, type RefObject, useEffect, useState } from 'react'

import styles from './TradeBarActions.module.css'

import { TRADE_SIDES } from '../config/tradeSides'
import { TRADE_WIDGET_ID, useJumpToTrade } from '../model/useSelectTradeToken'

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
            onClick={() => jumpToTrade(side)}
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

    const observer = new IntersectionObserver((entries) => setIsInView(entries.at(-1)?.isIntersecting ?? false), {
      // Inset from both visible edges by the minimum height, so the widget meets this band once that much of it shows
      rootMargin: `-${MIN_VISIBLE_WIDGET_HEIGHT}px 0px -${WALLET_BAR_HEIGHT + MIN_VISIBLE_WIDGET_HEIGHT}px 0px`,
    })
    observer.observe(widget)

    return () => observer.disconnect()
  }, [widgetRef])

  return isInView
}
