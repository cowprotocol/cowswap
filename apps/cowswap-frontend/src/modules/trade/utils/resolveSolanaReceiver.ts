// Mirrors swapFlow's `orderParams.recipient = recipientAddress || recipient || account`: prefer the
// resolved recipient address, then the raw recipient value, then default to sending to self.
export function resolveSolanaReceiver(params: {
  recipient: string | null | undefined
  recipientAddress: string | null | undefined
  account: string
}): string {
  return params.recipientAddress || params.recipient || params.account
}
