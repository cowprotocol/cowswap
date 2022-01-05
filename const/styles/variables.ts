import { transparentize } from 'polished'

export const Defaults = {
  borderRadius: '1.6rem'
}

export const Color = {
  white: '#F6F6F6',
  black: '#000000',
  orange: '#ED6834',
  grey: '#979797',
  border: transparentize(0.75, '#979797'),
  borderGradient: `linear-gradient(to bottom, ${transparentize(0.75, '#979797')}, ${transparentize(1, '#979797')})`
}

export const Font = {
  default: "'Inter', 'Helvetica Neue', Helvetica, sans-serif",
  arial: "Arial, Helvetica, sans-serif",
  sizeDefault: '1.6rem',
  weightLight: 300,
  weightNormal: 400,
  weightMedium: 500,
  weightBold: 700,
}

export const Media = {
  tinyScreen: '320px',
  xSmallScreen: '430px',
  smallScreen: '736px',
  smallScreenUp: '737px',
  mediumScreenSmall: '992px',
  mediumEnd: '1024px',
  desktopScreen: '1200px',
  desktopScreenLarge: '1400px',
  get tinyDown(): string {
    return `@media only screen and (max-width : ${this.tinyScreen})`
  },
  get xSmallDown(): string {
    return `@media only screen and (max-width : ${this.xSmallScreen})`
  },
  get mobile(): string {
    return `@media only screen and (max-width : ${this.smallScreen})`
  },
  get smallUp(): string {
    return `@media only screen and (min-width : ${this.smallScreen})`
  },
  get mediumUp(): string {
    return `@media only screen and (min-width : ${this.mediumScreenSmall})`
  },
  get mediumDown(): string {
    return `@media only screen and (max-width : ${this.mediumEnd})`
  },
  get mediumOnly(): string {
    return `@media only screen and (min-width : ${this.smallScreenUp}) and (max-width : ${this.mediumEnd})`
  },
  get desktopOnly(): string {
    return `@media only screen and (min-width : ${this.mediumEnd}) and (max-width : ${this.desktopScreen})`
  },
  get desktopDown(): string {
    return `@media only screen and (max-width : ${this.desktopScreen})`
  },
  get desktop(): string {
    return `@media only screen and (min-width : ${this.desktopScreen})`
  },
  get desktopLarge(): string {
    return `@media only screen and (min-width: ${this.desktopScreenLarge})`
  },
  get desktopLargeDown(): string {
    return `@media only screen and (max-width: ${this.desktopScreenLarge})`
  },
  get tabletPortrait(): string {
    return `@media (min-device-width: ${this.smallScreenUp}) and (max-device-width: ${this.mediumEnd}) and (orientation: portrait)`
  },
  get tabletLandscape(): string {
    return `@media (min-device-width: ${this.smallScreenUp}) and (max-device-width: ${this.mediumEnd}) and (orientation: landscape)`
  },
  get tablet(): string {
    return `@media (min-width: ${this.smallScreenUp}) and (max-width: ${this.mediumEnd}), ${this.tabletPortrait}, ${this.tabletLandscape}`
  },
  get tabletNoPortrait(): string {
    return `@media (min-width: ${this.smallScreenUp}) and (max-width: ${this.mediumEnd}), ${this.tabletLandscape}`
  },
  get tabletSmall(): string {
    return `@media (min-width: ${this.smallScreenUp}) and (max-width: ${this.mediumScreenSmall})`
  },
}
