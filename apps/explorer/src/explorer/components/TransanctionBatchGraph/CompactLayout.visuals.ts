import AMMLogo0x from '../../../assets/img/dex-logos/0x.png'
import AMMLogo1Inch from '../../../assets/img/dex-logos/1inch.png'
import AMMLogoBalancer from '../../../assets/img/dex-logos/balancer.png'
import CowAmmLogo from '../../../assets/img/dex-logos/cowamm.svg'
import AMMLogoCurve from '../../../assets/img/dex-logos/curve.png'
import AMMLogoHoneyswap from '../../../assets/img/dex-logos/honeyswap.png'
import AMMLogoMatcha from '../../../assets/img/dex-logos/matcha.png'
import AMMLogoParaswap from '../../../assets/img/dex-logos/paraswap.png'
import AMMLogoSushi from '../../../assets/img/dex-logos/sushi.png'
import AMMLogoUniswap from '../../../assets/img/dex-logos/uniswap.png'
import UnknownToken from '../../../assets/img/question1.svg'
import EthToken from '../../../assets/img/tokens/eth.png'
import { NATIVE_TOKEN_ADDRESS_LOWERCASE, WRAPPED_NATIVE_ADDRESS } from '../../../const'
import { Network } from '../../../types'
import { getImageUrl } from '../../../utils'

const ADDRESS_COLORS = ['#8CE3CA', '#9ABEFF', '#E6A6D2', '#F0B6A1', '#B7A8F2', '#79D4F1', '#F0AEB0', '#A2DCCB']
const USD_SUFFIX_REGEX = /^(.*)\s\((\$[^)]+)\)$/
const AMM_LOGO_MAP: Array<{ key: string; logo: string }> = [
  { key: 'uniswap', logo: AMMLogoUniswap },
  { key: 'balancer', logo: AMMLogoBalancer },
  { key: 'curve', logo: AMMLogoCurve },
  { key: 'sushi', logo: AMMLogoSushi },
  { key: '1inch', logo: AMMLogo1Inch },
  { key: 'paraswap', logo: AMMLogoParaswap },
  { key: 'matcha', logo: AMMLogoMatcha },
  { key: 'honeyswap', logo: AMMLogoHoneyswap },
  { key: 'cow amm', logo: CowAmmLogo },
  { key: 'cowamm', logo: CowAmmLogo },
  { key: 'cowswapethflow', logo: CowAmmLogo },
  { key: '0x', logo: AMMLogo0x },
]

export function formatAmountWithUsd(label: string, usdValue: number | undefined, showUsdValues: boolean): string {
  if (!showUsdValues || usdValue === undefined) {
    return label
  }

  const formattedUsd = usdValue.toLocaleString(undefined, {
    maximumFractionDigits: usdValue > 1_000 ? 0 : 2,
  })

  return `${label} ($${formattedUsd})`
}

export function splitAmountUsdLabel(label: string): { amountLabel: string; usdLabel?: string } {
  const match = label.match(USD_SUFFIX_REGEX)

  if (!match) {
    return { amountLabel: label }
  }

  const [, amountLabel, usdLabel] = match

  return { amountLabel, usdLabel }
}

export function getAmmLogo(dexLabel: string | undefined, _dexAddress?: string): string | undefined {
  const normalizedLabel = (dexLabel || '').toLowerCase()

  for (const entry of AMM_LOGO_MAP) {
    if (normalizedLabel.includes(entry.key)) {
      return entry.logo
    }
  }

  return undefined
}

export function getTokenLogo(address: string | undefined, networkId: Network | undefined): string {
  if (!address) {
    return UnknownToken
  }

  if (address.toLowerCase() === NATIVE_TOKEN_ADDRESS_LOWERCASE) {
    return EthToken
  }

  const wrappedNativeAddress =
    networkId && WRAPPED_NATIVE_ADDRESS[networkId] ? WRAPPED_NATIVE_ADDRESS[networkId].toLowerCase() : undefined
  if (wrappedNativeAddress && address.toLowerCase() === wrappedNativeAddress) {
    return EthToken
  }

  const normalizedAddress =
    address.toLowerCase() === NATIVE_TOKEN_ADDRESS_LOWERCASE && networkId ? WRAPPED_NATIVE_ADDRESS[networkId] : address

  return getImageUrl(normalizedAddress) || UnknownToken
}

export function formatTokenAmount(value: number, symbol: string | undefined): string {
  const amountLabel = value.toLocaleString(undefined, { maximumFractionDigits: 2 })

  return `${amountLabel} ${symbol || '?'}`
}

export function getAddressAccentColor(address: string): string {
  const hash = hashAddress(address)
  return ADDRESS_COLORS[Math.abs(hash) % ADDRESS_COLORS.length]
}

function hashAddress(address: string): number {
  let hash = 0
  for (let index = 0; index < address.length; index++) {
    hash = (hash << 5) - hash + address.charCodeAt(index)
    hash |= 0
  }

  return hash
}

// --- SVG text wrapping utilities ---

// Approximate character widths for common SVG font configurations.
// These are conservative estimates that prevent overflow in most cases.
const CHAR_WIDTH_BOLD_18 = 10.5
const CHAR_WIDTH_MEDIUM_12 = 6.8
const CHAR_WIDTH_MEDIUM_11 = 6.2

// CoW node content layout offsets (from card top)
const COW_AMOUNT_LINE_HEIGHT = 22
const COW_USD_OVERFLOW_LINE_HEIGHT = 16
const COW_MATCHED_BASELINE_Y = 78
const COW_SAVINGS_BASELINE_Y = 96
const COW_SAVINGS_LINE_HEIGHT = 16
const COW_BOTTOM_PADDING = 20
const COW_TEXT_LEFT_PAD = 14
const COW_TEXT_RIGHT_PAD = 14
const COW_AMOUNT_LEFT_PAD_WITH_LOGO = 36

export function wrapSvgText(text: string, charWidth: number, maxWidth: number): string[] {
  if (text.length * charWidth <= maxWidth) return [text]

  const words = text.split(/\s+/)
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    if (testLine.length * charWidth > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }
  if (currentLine) lines.push(currentLine)

  return lines.length > 0 ? lines : [text]
}

export function formatCowSavingsLabel(estimatedLpFeeSavingsUsd: number): string {
  return estimatedLpFeeSavingsUsd > 0
    ? `~$${estimatedLpFeeSavingsUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LP fees saved`
    : 'CoW matched internally (fee savings unavailable)'
}

export type CowTextLayout = {
  amountLines: string[]
  usdLabel?: string
  usdFitsInline: boolean
  savingsLines: string[]
  contentShift: number
  matchedY: number
  savingsY: number
  amountLineHeight: number
  savingsLineHeight: number
  totalHeight: number
}

export function computeCowTextLayout(
  matchedLabel: string,
  savingsLabel: string,
  hasTokenLogo: boolean,
  nodeWidth: number,
): CowTextLayout {
  const amountLeftPad = hasTokenLogo ? COW_AMOUNT_LEFT_PAD_WITH_LOGO : COW_TEXT_LEFT_PAD
  const amountMaxWidth = nodeWidth - amountLeftPad - COW_TEXT_RIGHT_PAD
  const textMaxWidth = nodeWidth - COW_TEXT_LEFT_PAD - COW_TEXT_RIGHT_PAD

  const { amountLabel, usdLabel } = splitAmountUsdLabel(matchedLabel)
  const amountLines = wrapSvgText(amountLabel, CHAR_WIDTH_BOLD_18, amountMaxWidth)

  let usdFitsInline = true
  if (usdLabel) {
    const lastLineWidth = amountLines[amountLines.length - 1].length * CHAR_WIDTH_BOLD_18
    const usdWidth = 2 + (usdLabel.length + 2) * CHAR_WIDTH_MEDIUM_11
    usdFitsInline = lastLineWidth + usdWidth <= amountMaxWidth
  }

  const savingsLines = wrapSvgText(savingsLabel, CHAR_WIDTH_MEDIUM_12, textMaxWidth)

  const amountExtra = (amountLines.length - 1) * COW_AMOUNT_LINE_HEIGHT
  const usdExtra = !usdFitsInline && usdLabel ? COW_USD_OVERFLOW_LINE_HEIGHT : 0
  const contentShift = amountExtra + usdExtra

  const matchedY = COW_MATCHED_BASELINE_Y + contentShift
  const savingsY = COW_SAVINGS_BASELINE_Y + contentShift

  const baseHeight = COW_SAVINGS_BASELINE_Y + COW_BOTTOM_PADDING
  const extraHeight = contentShift + (savingsLines.length - 1) * COW_SAVINGS_LINE_HEIGHT
  const totalHeight = Math.max(baseHeight + extraHeight, baseHeight)

  return {
    amountLines,
    usdLabel,
    usdFitsInline,
    savingsLines,
    contentShift,
    matchedY,
    savingsY,
    amountLineHeight: COW_AMOUNT_LINE_HEIGHT,
    savingsLineHeight: COW_SAVINGS_LINE_HEIGHT,
    totalHeight,
  }
}
