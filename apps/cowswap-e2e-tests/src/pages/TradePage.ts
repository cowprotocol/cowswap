/** Common shape shared by SwapPage, LimitPage and TwapPage — driven by `setupTestConditions`. */
export interface TradePage {
  goto(opts: { chainId: number; sell?: string; buy?: string }): Promise<void>
  enterSellAmount(amount: string): Promise<void>
  waitForQuote(): Promise<void>
}
