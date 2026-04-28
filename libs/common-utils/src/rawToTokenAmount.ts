export function rawToTokenAmount(value: number, tokenDecimals: number): bigint {
  return BigInt(value) * 10n ** BigInt(tokenDecimals)
}
