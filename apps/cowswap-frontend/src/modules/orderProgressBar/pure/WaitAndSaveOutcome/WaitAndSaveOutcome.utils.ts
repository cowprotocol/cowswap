export const MAX_SYMBOL_LENGTH = 12
export const MIN_GAIN_BAR_PX = 4
export const MIN_GAIN_PERCENT_DISPLAY = 0.01

export interface GainBarLayout {
  aloneFlex: number
  gainFlex: number
  gainMinWidthPx: number
}

export function formatGainPercentLabel(percent: number): string {
  if (percent > 0 && percent < MIN_GAIN_PERCENT_DISPLAY) {
    return `<${MIN_GAIN_PERCENT_DISPLAY}%`
  }

  const rounded = percent >= 10 ? percent.toFixed(1) : percent.toFixed(2)
  return `+${rounded}%`
}

export function getGainBarLayout(tradingAloneAmount: number, gainAmount: number): GainBarLayout {
  const safeAlone = Math.max(0, tradingAloneAmount)
  const safeGain = Math.max(0, gainAmount)
  const total = safeAlone + safeGain

  if (total <= 0) {
    return { aloneFlex: 1, gainFlex: 0, gainMinWidthPx: 0 }
  }

  if (safeGain <= 0) {
    return { aloneFlex: 1, gainFlex: 0, gainMinWidthPx: 0 }
  }

  return {
    aloneFlex: safeAlone / total,
    gainFlex: safeGain / total,
    gainMinWidthPx: MIN_GAIN_BAR_PX,
  }
}

export function truncateSymbol(symbol: string, maxLength: number = MAX_SYMBOL_LENGTH): string {
  if (symbol.length <= maxLength) {
    return symbol
  }

  return `${symbol.slice(0, maxLength)}…`
}
