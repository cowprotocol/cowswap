export function sumNullable(values: (number | null)[]): number | null {
  const defined = values.filter((value): value is number => value !== null)

  return defined.length ? defined.reduce((acc, value) => acc + value, 0) : null
}
