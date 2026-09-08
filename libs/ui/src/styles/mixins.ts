import { css } from 'styled-components/macro'

import { fadeIn } from './animations'
import { transitions } from './transitions'

import { UI } from '../enum'

export const textFadeIn = css`
  animation: ${fadeIn} ${transitions.duration.fast} ${transitions.timing.in};
`

/**
 * Shared dim + blur for overlay backdrops (Dialog, BottomDrawer).
 * Dim with a translucent fill — element `opacity` would hide `backdrop-filter`.
 * Override `--backdrop-opacity` (defaults to `--overlay-backdrop-opacity`) to fade the dim.
 */
export const OVERLAY_BACKDROP_EFFECT = css`
  --overlay-backdrop-opacity: 40%;
  --backdrop-opacity: var(--overlay-backdrop-opacity);

  background-color: color-mix(in srgb, var(${UI.MODAL_BACKDROP}) var(--backdrop-opacity), transparent);
  backdrop-filter: blur(10px);
`
