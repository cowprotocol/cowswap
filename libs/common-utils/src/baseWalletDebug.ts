export function logBaseWallet(scope: string, message: string, detail?: unknown): void {
  const label = `[cow-base-wallet:${scope}]`

  if (detail !== undefined) {
    console.log(label, message, detail)
    return
  }

  console.log(label, message)
}
