import type { CowProtocolTheme } from 'styled-components'

export function getPriceChangeColor(value: string | null, theme: CowProtocolTheme): string {
  if (!value) return theme.text
  const numericValue = parseFloat(value)
  if (isNaN(numericValue)) return theme.text
  if (numericValue > 0) return theme.success
  if (numericValue < 0) return theme.danger
  return theme.text
}
