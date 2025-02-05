import { Color } from 'styles/variables'
import type { CowProtocolTheme } from 'styled-components'

export function getPriceChangeColor(value: string | null, theme: CowProtocolTheme): string {
  if (!value) return Color.text1
  const numericValue = parseFloat(value)
  if (isNaN(numericValue)) return Color.text1
  if (numericValue > 0) return theme.success
  if (numericValue < 0) return theme.danger
  return Color.text1
}
