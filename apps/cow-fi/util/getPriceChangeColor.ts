import type { DefaultTheme } from 'styled-components/macro'

export function getPriceChangeColor(value: number | string | null, theme: DefaultTheme): string {
  if (value === null) return theme.text

  const numericValue = typeof value === 'number' ? value : parseFloat(value)

  if (Number.isNaN(numericValue)) return theme.text
  if (numericValue > 0) return theme.success
  if (numericValue < 0) return theme.danger
  return theme.text
}
