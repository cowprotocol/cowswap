/**
 * Returns true if the string value is zero in hex
 * @param hexNumberString
 */
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function isZero(hexNumberString: string) {
  return /^0x0*$/.test(hexNumberString)
}
