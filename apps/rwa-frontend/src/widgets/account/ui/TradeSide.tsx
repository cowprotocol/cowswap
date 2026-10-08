import type { ReactNode } from 'react'

import styles from './AccountTable.module.css'

import type { TradeSide as Side } from '../lib/tradeLeg'

export function TradeSide({ side }: { side: Side }): ReactNode {
  return <span className={side === 'buy' ? styles.buy : styles.sell}>{side === 'buy' ? 'Buy' : 'Sell'}</span>
}
