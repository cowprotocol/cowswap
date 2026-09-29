import styled from 'styled-components/macro'

import { OVERLAY_Z_INDEX } from '../../consts'

/**
 * One stacking context per overlay so a later portal (nested drawer, receipt)
 * paints over the previous overlay without split backdrop/viewport z-indexes.
 */
export const OverlayLayer = styled.div.attrs({
  'data-overlay-layer': '',
})`
  position: fixed;
  inset: 0;
  z-index: ${OVERLAY_Z_INDEX.overlay};
  pointer-events: none;
  isolation: isolate;
`
