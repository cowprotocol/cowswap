export function fixTokenName(tokenName: string): string {
  // TODO: this is ugly and I'm not happy with it either
  // It'll probably go away when the tokens overhaul is implemented
  // For now, this is a problem for favourite tokens cached locally with the hardcoded name for USDC token
  // Using the wrong name breaks the signature.
  return tokenName === 'USD//C' ? 'USD Coin' : tokenName
}
