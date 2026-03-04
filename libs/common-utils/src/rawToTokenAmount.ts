export function rawToTokenAmount(value: number | bigint, tokenDecimals: number): bigint {
  return BigInt(value) * 10n ** BigInt(tokenDecimals)
}
