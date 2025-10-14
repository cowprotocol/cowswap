import type { SaucerPalette } from './CowSaucerScene'

const COWFI_BEAM_COLOR = '#f2cd16'
const WHITE_TWINKLE = '#fff8f7'

export const SWAP_SAUCER_PALETTE_LIGHT: SaucerPalette = {
  beam: '#3fc4ff',
  beamOpacity: 0.5,
  side: '#005eb7',
  dome: '#012f7a',
  cap: '#fbe872',
  stars: WHITE_TWINKLE,
}

export const SWAP_SAUCER_PALETTE_DARK: SaucerPalette = {
  beam: COWFI_BEAM_COLOR,
  beamOpacity: 0.25,
  side: '#494c8c',
  dome: '#2c2f6f',
  cap: COWFI_BEAM_COLOR,
  stars: COWFI_BEAM_COLOR,
}

export const COWFI_SAUCER_PALETTE_LIGHT: SaucerPalette = {
  beam: COWFI_BEAM_COLOR,
  beamOpacity: 0.4,
  side: '#504444',
  dome: '#23191a',
  cap: COWFI_BEAM_COLOR,
  stars: WHITE_TWINKLE,
}
