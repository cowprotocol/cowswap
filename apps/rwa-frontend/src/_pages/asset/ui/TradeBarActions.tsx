'use client'

import { type ReactNode, type RefObject, useEffect, useState } from 'react'

import styles from './TradeBarActions.module.css'

import { TRADE_SIDES } from '../config/tradeSides'
import { TRADE_WIDGET_ID, useJumpToTrade } from '../model/useSelectTradeToken'

import { WalletBarSlot } from '@/widgets/header'

const WALLET_BAR_HEIGHT = 56
const MIN_VISIBLE_WIDGET_HEIGHT = 120
const VISIBILITY_STEPS = Array.from({ length: 101 }, (_, step) => step / 100)

interface TradeBarActionsProps {
  ticker: string
  widgetRef: RefObject<HTMLElement | null>
}

/** Buy and Sell in the wallet bar, shown while the trade widget is out of view */
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

    const observer = new IntersectionObserver(
      (entries) => setIsInView((entries.at(-1)?.intersectionRect.height ?? 0) >= MIN_VISIBLE_WIDGET_HEIGHT),
      // Every 1% step reports the height that shows above the bar, about every 11px of the widget
      { rootMargin: `0px 0px -${WALLET_BAR_HEIGHT}px 0px`, threshold: VISIBILITY_STEPS },
    )
    observer.observe(widget)

    return () => observer.disconnect()
  }, [widgetRef])

  return isInView
}
