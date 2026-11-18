import { CowSwapTheme, UI } from '@cowprotocol/ui'

import { darken, transparentize } from 'color2k'
import { css, FlattenSimpleInterpolation } from 'styled-components/macro'

import { GRAFFITI_CANVAS_PNG_URL, WALL_CSS_BLEND_MODE } from './graffitiWall.constants'
import { isGraffitiTheme } from './graffitiWall.utils'

/**
 * Everything the graffiti theme paints is the dark treatment, whatever colour scheme the rest of
 * the app is in: the theme has one variant, and the paint over this base is composited with a
 * lightening blend, which leaves a light base near-black and the tags with it. A dark base is also
 * what the page can show before the remote canvas arrives.
 */
const WALL_BASE_COLOR = '#0E0F2D'
const WALL_SCENE_DARK_SCHEME = true

/**
 * The live graffiti wall, laid over the regular CoW Swap backdrop.
 *
 * Cover against the *viewport*, never against the page box. Covering the box refits the paint to a
 * height that grows ~100px as the widget, its quote and the banners settle, zooming it ~10% and
 * sliding it sideways on every load; sizing it by the box's width held still, but then the wall
 * ended wherever `width / 16:9` fell and left the rest of a narrow page bare. The viewport is both
 * stable through that growth and filled at every window shape, so the paint keeps one size per
 * window and a narrow one simply shows less of the wall (see SAFE_AREA_INSET in freeSpot.utils).
 */
const WALL_LAYER = `url(${GRAFFITI_CANVAS_PNG_URL}) no-repeat center / cover`

/** Rendered plaster, laid over the paint so the graffiti picks up the surface instead of floating on it. */
const WALL_SURFACE_LAYER =
  'repeating-linear-gradient(135deg, rgba(14, 15, 45, 0.55) 0 3px, rgba(120, 150, 255, 0.06) 3px 9px)'

/**
 * How much of the wall the trade card gives up, as `transparentize` amounts. Its inner panels sit
 * on its outer surface, so their alphas multiply: the pair is tuned together to leave the card a
 * surface with the wall showing through it, not a window onto the wall, and to keep body text
 * above the 4.5:1 contrast of the opaque theme.
 */
const WALL_VEIL_ALPHA = 0.12
const WALL_VEIL_DARKER_ALPHA = 0.18

/**
 * Closed, the footer paints nothing of its own: the scene behind it already supplies the dark mass
 * the opaque themes get from the footer's own colour, and a tint laid on top of that reads as a
 * rectangle ruled across the page.
 */
const WALL_FOOTER_BACKGROUND = 'transparent'

/**
 * Open, it carries columns of links that the wall runs straight through, so it needs a backdrop.
 * Faded in rather than switched on, because a flat start is that same rectangle: by the time the
 * first row of links arrives it is near solid, while the top edge still dissolves into the page.
 */
const WALL_FOOTER_BACKGROUND_EXPANDED = 'linear-gradient(to bottom, rgb(14 15 45 / 0%) 0, rgb(14 15 45 / 88%) 140px)'

/**
 * The footer's ink under this theme. Its own warm greys (#827474 text, #685B5B logos) read as dirt
 * against the blues of the scene they now sit on; this is drawn from the scene's own palette.
 */
const WALL_FOOTER_INK = '#8690D9'

/**
 * How solid the cow scene stays over the wall. Its silhouettes are opaque, and the hill alone hides
 * a tenth of the canvas, so paint that lands under it is simply gone. At this much the scene still
 * reads as a scene while the paint behind it comes through.
 */
const WALL_SCENE_OPACITY = 0.6

/** Backdrop blur for the app menu bar. The wall is the backdrop here, and the default 16px smears it into a haze. */
export const GRAFFITI_MENU_BLUR = '3px'

interface GraffitiWallBackdropParams {
  customTheme?: CowSwapTheme
  /** A page that owns the viewport and draws its own wall. */
  fullBleed?: boolean
  /** Builds the page's cow scene as a `background` shorthand for the given colour scheme. */
  getSceneLayer: (darkMode: boolean) => string
}

interface GraffitiWallCardVeilParams {
  customTheme?: CowSwapTheme
  fullBleed?: boolean
  /** `theme.paper` of the active colour scheme. */
  paper: string
}

/**
 * The wall and the cow scene over it, for the box that spans the whole page including the footer.
 *
 * Not on the body wrapper: that box stops short of the footer, which is its sibling, so anything
 * drawn near the foot of the canvas landed ~150px above the bottom of the page, and the scene's
 * own dark ground stopped 65px inside the footer, drawing two stacked rectangles across it.
 */
export function graffitiWallBackdropCss({
  customTheme,
  fullBleed,
  getSceneLayer,
}: GraffitiWallBackdropParams): FlattenSimpleInterpolation | null {
  if (!isGraffitiTheme(customTheme)) return null

  return css`
    isolation: isolate;
    background-color: ${WALL_BASE_COLOR};

    /*
     * Fixed rather than a background on this box: a background covers the box, whose height both
     * grows as the page settles and runs far past the window on a narrow one, where the paint
     * then stopped mid-page. Pinned to the viewport it is immune to both.
     */
    &::before {
      content: '';
      position: fixed;
      inset: 0;
      z-index: -2;
      pointer-events: none;
      background: ${wallBackdrop(fullBleed)};
      background-blend-mode: ${wallBackdropBlendMode(fullBleed)};
    }

    /* A background layer cannot carry an alpha, hence the second pseudo-element. */
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      z-index: -1;
      pointer-events: none;
      opacity: ${WALL_SCENE_OPACITY};
      background: ${getSceneLayer(WALL_SCENE_DARK_SCHEME)};
    }
  `
}

/**
 * The trade card, the one surface that lets a little of the wall through.
 *
 * Only that card: declared on the body wrapper itself the veil reached every panel in the page,
 * and paint running under an order table or a modal's text is unreadable at any alpha. Scoped
 * instead to `#card`, the card's own element and the hook injected widgets already style by, so
 * the redeclared tokens reach the card and its panels and stop there — the trade modals render as
 * siblings of the card, outside it, and keep the opaque theme. A full-bleed page has no wall
 * behind it (see `graffitiWallBackdropCss`), so there is nothing to let through.
 */
export function graffitiWallCardVeilCss({
  customTheme,
  fullBleed,
  paper,
}: GraffitiWallCardVeilParams): FlattenSimpleInterpolation | null {
  if (!isGraffitiTheme(customTheme) || fullBleed) return null

  return css`
    #card {
      ${UI.COLOR_PAPER}: ${transparentize(paper, WALL_VEIL_ALPHA)};
      ${UI.COLOR_PAPER_DARKER}: ${transparentize(darken(paper, 0.07), WALL_VEIL_DARKER_ALPHA)};

      /*
       * Menus here open inside the card (portal={false}), so they inherit its veil and show
       * both the wall and the card's own rows through their text. Anything that opens over the
       * card takes the opaque theme back.
       */
      [data-reach-menu-popover] {
        ${UI.COLOR_PAPER}: ${paper};
        ${UI.COLOR_PAPER_DARKER}: ${darken(paper, 0.07)};
      }
    }
  `
}

/**
 * The footer's colours over the wall. Applied from its slot rather than through a prop on the
 * shared Footer: the colour is this theme's business, not the component's, and its own background
 * token doubles as the social icons' glyph colour, which has to stay opaque.
 */
export function graffitiWallFooterCss(customTheme?: CowSwapTheme): FlattenSimpleInterpolation | null {
  if (!isGraffitiTheme(customTheme)) return null

  return css`
    > footer {
      --color: ${WALL_FOOTER_INK};
      --colorTitle: ${WALL_FOOTER_INK};
      /* Read by the shared Footer's product logos, which have no token of their own. */
      --footerLogoColor: ${WALL_FOOTER_INK};
      --bgCollapsed: ${WALL_FOOTER_BACKGROUND};
      --bgExpanded: ${WALL_FOOTER_BACKGROUND_EXPANDED};
    }
  `
}

/**
 * The paint drops out on a full-bleed page, which owns the viewport and draws its own wall: the
 * wall page renders the same canvas live, over a deliberately transparent root so its paint blends
 * with whatever the shell puts behind it, and a second static copy back there doubles every tag.
 * The plaster and the base colour stay, so the page keeps its surface rather than going flat.
 */
function wallBackdrop(fullBleed?: boolean): string {
  if (fullBleed) return `${WALL_SURFACE_LAYER} ${WALL_BASE_COLOR}`

  return `${WALL_SURFACE_LAYER}, ${WALL_LAYER} ${WALL_BASE_COLOR}`
}

function wallBackdropBlendMode(fullBleed?: boolean): string {
  if (fullBleed) return 'normal'

  return `normal, ${WALL_CSS_BLEND_MODE}`
}
