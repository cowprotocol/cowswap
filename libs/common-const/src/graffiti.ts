/** Raw `REACT_APP_GRAFFITI_API`: relative by default, may be `http(s)://` or `ws(s)://`. */
export const GRAFFITI_API_RAW_BASE = process.env.REACT_APP_GRAFFITI_API || '/v1'

/** Graffiti wall REST base, without a trailing slash. */
export const GRAFFITI_API_BASE = GRAFFITI_API_RAW_BASE.replace(/\/+$/, '')

/** Full-wall PNG snapshot. Also the Solana theme's page background. */
export const GRAFFITI_CANVAS_PNG_URL = `${GRAFFITI_API_BASE}/canvas.png`

/**
 * How painted cells sit on the CoW Swap background: `over` keeps paint opaque,
 * `blend` mixes its colours into the background. Drives both the wall canvas
 * and the Solana theme's page background, so the two always agree.
 */
export type WallComposite = 'over' | 'blend'

export const WALL_COMPOSITE: WallComposite = 'over'

/**
 * The paint layer's CSS `mix-blend-mode`. The wall page's own chrome is dark in both
 * colour schemes, so this one does not vary with it. The canvas has a real alpha
 * channel, so `over` composites normally there.
 */
const PAINT_MIX_BLEND_MODE: Record<WallComposite, string> = {
  over: 'normal',
  blend: 'screen',
}

/**
 * The wall layer's CSS `background-blend-mode`, per colour scheme.
 *
 * `canvas.png` carries no alpha channel — an unpainted cell is opaque black — so `normal`
 * would paint the whole backdrop black instead of letting it through. `lighten` keeps the
 * paint on top while black defers to the backdrop, supplying the alpha the image lacks.
 * Each mode needs its opposite operator per scheme: the lightening ones vanish on a light
 * backdrop, the darkening ones on a dark one.
 */
const CSS_BLEND_MODE: Record<WallComposite, { dark: string; light: string }> = {
  over: { dark: 'lighten', light: 'darken' },
  blend: { dark: 'screen', light: 'multiply' },
}

export const WALL_PAINT_MIX_BLEND_MODE = PAINT_MIX_BLEND_MODE[WALL_COMPOSITE]

export function wallCssBlendMode(darkMode: boolean): string {
  const modes = CSS_BLEND_MODE[WALL_COMPOSITE]

  return darkMode ? modes.dark : modes.light
}
