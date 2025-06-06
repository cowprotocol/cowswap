import 'inter-ui'

export interface Fonts {
  fontDefault: string
  fontVariable: string
  fontThin: string
  fontLight: string
  fontLighter: string
  fontNormal: string
  fontMedium: string
  fontBold: string
  fontHeavy: string
  fontBlack: string
  fontSizeDefault: string
  fontLineHeight: string
}

const fontsVariables: Fonts = {
  fontDefault: 'Inter',
  fontVariable: 'Inter var',
  fontThin: '100',
  fontLight: '200',
  fontLighter: '300',
  fontNormal: '400',
  fontMedium: '500',
  fontBold: '600',
  fontHeavy: '700',
  fontBlack: '800',
  fontSizeDefault: '1.3rem',
  fontLineHeight: '2.6rem',
}

export function getFonts(): Fonts {
  return fontsVariables
}
