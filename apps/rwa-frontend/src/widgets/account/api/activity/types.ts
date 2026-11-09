import type { OrderType } from '../../lib/orderType'
import type { TradeLeg } from '../../lib/tradeLeg'
import type { TwapPart } from '../../lib/twapPart'
import type { RwaTokenSummary } from '@/entities/asset'

export interface Activity extends TradeLeg {
  id: string
  kind: ActivityKind
  orderType: OrderType
  /** Set for a part of a TWAP whose schedule is known */
  twapPart: TwapPart | null
  /** Unix seconds, `null` when unknown */
  timestamp: number | null
  txHash: string | null
  orderUid: string | null
}

export type ActivityKind = 'trade'

/** A source of the account history, so the backing API can be replaced without touching the UI */
export interface ActivityProvider {
  /** Newest first */
  getActivity(query: ActivityQuery): Promise<Activity[]>
}

export interface ActivityQuery {
  owner: string
  /** Only the activity involving these tokens is returned */
  tokens: RwaTokenSummary[]
  limit: number
}
