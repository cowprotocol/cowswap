import { Color } from 'styles/variables'

export function getPriceChangeColor(value) {
  if (!value) return Color.text1
  if (Number(value) > 0) return Color.success
  else if (Number(value) < 0) return Color.danger
  return Color.text1
}
