export function rawToTokenAmount(value: number | bigint, tokenDecimals: number | bigint): bigint {
  return BigInt(value) * 10n ** BigInt(tokenDecimals)
}
