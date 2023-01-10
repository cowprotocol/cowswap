// Rounds number only if the number of decimals goes above the decimals param
export const limitDecimals = (amount: number, decimals: number): number => {
  return +parseFloat(amount?.toFixed(decimals))
}
