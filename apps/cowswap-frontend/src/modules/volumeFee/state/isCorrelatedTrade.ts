import { CorrelatedTokens } from 'entities/correlatedTokens/state/correlatedTokensAtom'

export function isCorrelatedTrade(
  inputCurrencyAddress: string,
  outputCurrencyAddress: string,
  correlatedTokens: CorrelatedTokens[],
): boolean {
  return correlatedTokens.some((tokens) => {
    const hasInputCurrency = tokens[inputCurrencyAddress]
    const hasOutputCurrency = tokens[outputCurrencyAddress]

    return Object.keys(tokens).length === 1
      ? // If there is only one asset in the list, it means that it is a global correlated token
        hasInputCurrency || hasOutputCurrency
      : // If there are two tokens in the list, it means that it is a pair correlated token
        hasInputCurrency && hasOutputCurrency
  })
}
