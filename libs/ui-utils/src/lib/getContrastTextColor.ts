import { hasBadContrast } from 'color2k'

const contrastStandard = 'aa' // Options: 'decorative', 'readable', 'aa', 'aaa'
const darkTextPrimary = '#000000'
const lightTextPrimary = '#FFFFFF'

function getContrastText(background: string, preferredTextColor: string | (() => string)): string {
  const resolvedTextColor = typeof preferredTextColor === 'function' ? preferredTextColor() : preferredTextColor

  // Check if the preferred text color has bad contrast against the background
  if (!hasBadContrast(resolvedTextColor, contrastStandard, background)) {
    return resolvedTextColor // Good contrast, use preferred color
  }

  // If contrast is bad, decide between dark or light text color
  return hasBadContrast(darkTextPrimary, contrastStandard, background) ? lightTextPrimary : darkTextPrimary
}

export { getContrastText }
