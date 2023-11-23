/* eslint-disable @typescript-eslint/naming-convention */

// Utility functions for color manipulation
function clamp(value: number, min = 0, max = 1): number {
  return Math.min(Math.max(min, value), max)
}

function intToHex(int: number): string {
  const hex = int.toString(16)
  return hex.length === 1 ? `0${hex}` : hex
}

function hexToRgb(color: string): string {
  color = color.slice(1)
  const re = new RegExp(`.{1,${color.length >= 6 ? 2 : 1}}`, 'g')
  const matchResult = color.match(re)

  if (!matchResult) {
    return ''
  }

  const colors = matchResult as RegExpMatchArray

  let processedColors
  if (colors[0].length === 1) {
    processedColors = colors.map((n) => n + n)
  } else {
    processedColors = colors
  }

  return `rgb${processedColors.length === 4 ? 'a' : ''}(${processedColors
    .map((n, index) => {
      return index < 3 ? parseInt(n, 16) : Math.round((parseInt(n, 16) / 255) * 1000) / 1000
    })
    .join(', ')})`
}

function decomposeColor(color: string): { type: string; values: number[]; colorSpace?: string } {
  if (color.charAt(0) === '#') {
    return decomposeColor(hexToRgb(color))
  }

  const marker = color.indexOf('(')
  const type = color.substring(0, marker)
  const valuesString = color.substring(marker + 1, color.length - 1).split(',')

  const values = valuesString.map((value) => parseFloat(value))

  return { type, values }
}

function recomposeColor(color: { type: string; values: number[]; colorSpace?: string }): string {
  const { type, values } = color
  const recomposed = values.map((n, i) => (type.indexOf('rgb') !== -1 && i < 3 ? parseInt(n.toString(), 10) : n))

  return `${type}(${recomposed.join(', ')})`
}

function rgbToHex(color: string): string {
  const { values } = decomposeColor(color)
  return `#${values.map((n, i) => intToHex(i === 3 ? Math.round(255 * n) : n)).join('')}`
}

function hslToRgb(color: string): string {
  const { values } = decomposeColor(color)
  const h = values[0]
  const s = values[1] / 100
  const l = values[2] / 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number, k = (n + h / 30) % 12) => l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)

  let type = 'rgb'
  const rgb = [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)]

  if (color.includes('hsla')) {
    type += 'a'
    rgb.push(values[3])
  }

  return recomposeColor({ type, values: rgb })
}

function getLuminance(color: string): number {
  let { values } = decomposeColor(color)

  values = values.map((val) => {
    val /= 255 // normalized
    return val <= 0.03928 ? val / 12.92 : ((val + 0.055) / 1.055) ** 2.4
  })

  return 0.2126 * values[0] + 0.7152 * values[1] + 0.0722 * values[2]
}

function getContrastRatio(foreground: string, background: string): number {
  const lumA = getLuminance(foreground)
  const lumB = getLuminance(background)
  return (Math.max(lumA, lumB) + 0.05) / (Math.min(lumA, lumB) + 0.05)
}

function alpha(color: string, value: number): string {
  const decomposedColor = decomposeColor(color)
  value = clamp(value)

  if (decomposedColor.type === 'rgb' || decomposedColor.type === 'hsl') {
    decomposedColor.type += 'a'
  }
  decomposedColor.values[3] = value

  return recomposeColor(decomposedColor)
}

function darken(color: string, coefficient: number): string {
  const decomposedColor = decomposeColor(color)
  coefficient = clamp(coefficient)

  if (decomposedColor.type.indexOf('hsl') !== -1) {
    decomposedColor.values[2] *= 1 - coefficient
  } else if (decomposedColor.type.indexOf('rgb') !== -1) {
    for (let i = 0; i < 3; i += 1) {
      decomposedColor.values[i] *= 1 - coefficient
    }
  }

  return recomposeColor(decomposedColor)
}

function lighten(color: string, coefficient: number): string {
  const decomposedColor = decomposeColor(color)
  coefficient = clamp(coefficient)

  if (decomposedColor.type.indexOf('hsl') !== -1) {
    decomposedColor.values[2] += (100 - decomposedColor.values[2]) * coefficient
  } else if (decomposedColor.type.indexOf('rgb') !== -1) {
    for (let i = 0; i < 3; i += 1) {
      decomposedColor.values[i] += (255 - decomposedColor.values[i]) * coefficient
    }
  }

  return recomposeColor(decomposedColor)
}

function emphasize(color: string, coefficient = 0.15): string {
  return getLuminance(color) > 0.5 ? darken(color, coefficient) : lighten(color, coefficient)
}

export function resolveCssVar(cssVarName: string): string {
  // Assuming the CSS variable is set on the :root element
  const style = getComputedStyle(document.documentElement)

  console.log('resolveCssVar', cssVarName, style.getPropertyValue(cssVarName).trim())

  return style.getPropertyValue(cssVarName).trim()
}

function getContrastText(background: string, preferredTextColor: string | (() => string)): string {
  const contrastThreshold = 4.5 // WCAG recommended contrast ratio
  const darkTextPrimary = '#000000' // Dark text color
  const lightTextPrimary = '#FFFFFF' // Light text color

  console.log('getContrastText', background, preferredTextColor)

  const resolvedPreferredTextColor =
    typeof preferredTextColor === 'function' ? preferredTextColor() : preferredTextColor

  // Check contrast for preferred text color
  if (getContrastRatio(background, resolvedPreferredTextColor) >= contrastThreshold) {
    return resolvedPreferredTextColor
  }

  // Fallback to black or white
  const contrastText =
    getContrastRatio(background, darkTextPrimary) >= contrastThreshold ? darkTextPrimary : lightTextPrimary

  // Warning for low contrast in non-production environments
  if (process.env['NODE_ENV'] !== 'production') {
    const contrast = getContrastRatio(background, contrastText)
    if (contrast < 3) {
      console.error(
        `The contrast ratio of ${contrast}:1 for ${contrastText} on ${background} ` +
          'falls below the WCAG recommended absolute minimum contrast ratio of 3:1. ' +
          'https://www.w3.org/TR/WCAG20/#visual-audio-contrast-contrast'
      )
    }
  }

  return contrastText
}

// Export all functions
export {
  clamp,
  intToHex,
  hexToRgb,
  decomposeColor,
  recomposeColor,
  rgbToHex,
  hslToRgb,
  getContrastText,
  getLuminance,
  getContrastRatio,
  alpha,
  darken,
  lighten,
  emphasize,
}
