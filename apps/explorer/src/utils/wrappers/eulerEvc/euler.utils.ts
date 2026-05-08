export function formatAmount(raw: bigint | undefined, decimals: number | undefined): string {
  if (raw === undefined) return '…'
  if (decimals === undefined) return raw.toString()
  return (Number(raw) / 10 ** decimals).toLocaleString(undefined, { maximumFractionDigits: 6 })
}

export function subaccountNumber(owner: string, account: string): number {
  return parseInt(owner.slice(-2), 16) ^ parseInt(account.slice(-2), 16)
}
