export type BigintIsh = bigint | string | number

export enum TradeType {
  EXACT_INPUT,
  EXACT_OUTPUT,
}

export enum Rounding {
  ROUND_DOWN,
  ROUND_HALF_UP,
  ROUND_UP,
}
export const MaxUint256 = 2n ** 256n - 1n
