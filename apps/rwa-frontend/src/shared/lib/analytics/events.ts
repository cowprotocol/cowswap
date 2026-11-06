import type { AnalyticsPayload } from '@cowprotocol/analytics/order-lifecycle'

export type RwaAnalyticsEventName = keyof RwaAnalyticsEvents

/** Event name → params, documented in `docs/analytics.md` */
export interface RwaAnalyticsEvents {
  page_view: { page_path: string; page_title: string }
  set_user_account: { userId: string | undefined }
  wallet_connected: { eventType: 'wallet_initial_connection'; walletAddress: string; walletName: string }
  wallet_switched: {
    eventType: 'wallet_switch'
    walletAddress: string
    walletName: string
    previousWalletAddress: string
    previousWalletName: string
  }
  wallet_disconnected: {
    eventType: 'wallet_disconnection'
    previousWalletAddress: string
    previousWalletName: string
  }
  connect_wallet_click: { variant: 'primary' | 'secondary' }
  search_asset_select: { ticker: string; search_term: string }
  watchlist_toggle: { ticker: string; isWatched: boolean }
  assets_filter_change: {
    /** Changed filters, comma separated */
    changed: string
    type?: string
    issuers?: string
    chainIds?: string
    minMarketCap?: number
    minVolume24h?: number
    watchlistOnly: boolean
  }
  trade_side_select: { ticker: string; side: TradeSide; placement: 'trade_widget' | 'wallet_bar' }
  trade_token_select: {
    ticker: string
    issuer: string
    chainId: number
    side: TradeSide
    placement: 'trade_widget' | 'stock_tokens'
  }
  trade_network_select: { ticker: string; chainId: number }
  market_kind_select: { ticker: string; marketKind: string }
  chart_range_select: { range: string }
  chart_type_select: { chartType: string }
  news_article_click: { ticker: string; source: string }
  order_submitted: OrderParams & { side: TradeSide }
  swap_executed: OrderParams
  swap_cancelled: OrderParams
  swap_expired: OrderParams
  order_cancel: { chainId: number; cancellationType: string; result: 'cancelled' | 'rejected' | 'failed' }
  portfolio_refresh: Record<string, never>
}

/** The CoW Swap order event payload (`@cowprotocol/analytics/order-lifecycle`) and the asset ticker */
type OrderParams = AnalyticsPayload & { ticker: string }

type TradeSide = 'buy' | 'sell'
