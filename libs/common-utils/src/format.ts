const DEFAULT_MAX_SYMBOL_LENGTH = 12

// TODO: move to another file
export function formatSymbol(symbol: string | undefined, maxLength = DEFAULT_MAX_SYMBOL_LENGTH): string | undefined {
  return symbol && symbol.length > maxLength ? symbol.slice(0, maxLength) + '...' : symbol
}
