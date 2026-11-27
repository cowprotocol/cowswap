const HEX_COLOR = /^#([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i

/**
 * TradingView skips text and fills in 8-digit hex colors, which `getComputedStyle` returns for `rgba()` variables,
 * so a hex color becomes `rgba()`. `alpha` replaces the color's own; other colors are returned as is
 */
export function toTradingViewColor(color: string, alpha?: number): string {
  const hex = HEX_COLOR.exec(color)?.[1]

  if (!hex) return color

  const digits = hex.length <= 4 ? [...hex].map((digit) => digit + digit).join('') : hex
  const [red, green, blue, ownAlpha = 255] = (digits.match(/../g) ?? []).map((channel) => parseInt(channel, 16))

  return `rgba(${red}, ${green}, ${blue}, ${alpha ?? Math.round((ownAlpha / 255) * 100) / 100})`
}
