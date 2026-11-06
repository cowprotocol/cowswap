export type RwaAnalyticsEventName = keyof RwaAnalyticsEvents

/** Event name → params, documented in `docs/analytics.md` */
export interface RwaAnalyticsEvents {
  page_view: { page_path: string; page_title: string }
  wallet_connected: { walletAddress: string; walletName: string }
  wallet_switched: {
    walletAddress: string
    walletName: string
    previousWalletAddress: string
    previousWalletName: string
  }
  wallet_disconnected: { previousWalletAddress: string; previousWalletName: string }
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
  order_submitted: OrderParams & { side: TradeSide; kind: string; sellAmountUnits: string; buyAmountUnits: string }
  swap_executed: OrderParams & { executedSellAmount: string; executedBuyAmount: string }
  swap_cancelled: OrderParams
  swap_expired: OrderParams
  order_cancel: { chainId: number; cancellationType: string; result: 'cancelled' | 'rejected' | 'failed' }
  portfolio_refresh: Record<string, never>
}

interface OrderParams {
  ticker: string
  orderId: string
  chainId: number
  orderType: string
  walletAddress: string
  sellToken: string
  buyToken: string
  sellTokenSymbol?: string
  buyTokenSymbol?: string
  isEoaTwap?: boolean
}

type TradeSide = 'buy' | 'sell'
