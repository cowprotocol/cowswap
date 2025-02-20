import type { DefaultTheme } from 'styled-components'

export function getPriceChangeColor(value: string | null, theme: DefaultTheme): string {
  if (!value) return theme.text
  const numericValue = parseFloat(value)
  if (isNaN(numericValue)) return theme.text
  if (numericValue > 0) return theme.success
  if (numericValue < 0) return theme.danger
  return theme.text
}
