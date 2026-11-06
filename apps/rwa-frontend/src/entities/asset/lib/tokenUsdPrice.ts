/**
 * USD per token. The stock price of the shares the token stands for when its multiplier is known: a token price comes
 * from one CoinGecko id shared by every network, while multipliers can differ per network (wrapped xStocks vaults).
 * Otherwise the token price, then the stock price as one share. `null` without any price
 */
export function getTokenUsdPrice(
  tokenPrice: number | null,
  stockPrice: number | null,
  sharesPerToken: number | null,
): number | null {
  if (stockPrice !== null && sharesPerToken !== null) return stockPrice * sharesPerToken

  return tokenPrice ?? stockPrice
}
