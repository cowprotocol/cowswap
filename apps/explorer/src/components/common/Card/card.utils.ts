type ThemeColor = 'green' | 'red1' | 'grey'

export function getColorBySign(n: number): ThemeColor {
  if (n > 0) {
    return 'green'
  } else if (n < 0) {
    return 'red1'
  }

  return 'grey'
}
