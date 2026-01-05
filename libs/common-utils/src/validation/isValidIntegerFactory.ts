export function isValidIntegerFactory(min: number, max: number) {
  return (value: number): boolean => {
    return Number.isInteger(value) && value >= min && value <= max
  }
}
