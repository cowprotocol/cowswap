import { type RwaQuoteSide, type RwaToken } from '@/entities/asset'
import { type RwaAnalyticsEvents, trackEvent } from '@/shared/lib/analytics'

type TokenSelectPlacement = RwaAnalyticsEvents['trade_token_select']['placement']

export function trackTradeTokenSelect(
  ticker: string,
  token: RwaToken,
  side: RwaQuoteSide,
  placement: TokenSelectPlacement,
): void {
  trackEvent('trade_token_select', { ticker, issuer: token.issuer, chainId: token.chainId, side, placement })
}
