import { Drawer as BaseDrawer } from '@base-ui/react/drawer'
import styled from 'styled-components/macro'

import { UI } from '../../enum'
import { OVERLAY_BACKDROP_EFFECT } from '../../styles/mixins'

/** Matches Base UI drawer demos: duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] */
const DRAWER_TRANSITION_DURATION = '450ms'
const DRAWER_TRANSITION_EASING = 'cubic-bezier(0.32, 0.72, 0, 1)'

export const Backdrop = styled(BaseDrawer.Backdrop)`
  ${OVERLAY_BACKDROP_EFFECT}

  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: auto;
  --backdrop-opacity: calc(var(--overlay-backdrop-opacity) * (1 - var(--drawer-swipe-progress, 0)));
  transition: opacity ${DRAWER_TRANSITION_DURATION} ${DRAWER_TRANSITION_EASING};

  &[data-starting-style],
  &[data-ending-style] {
    opacity: 0;
  }

  &[data-ending-style] {
    transition-duration: calc(var(--drawer-swipe-strength, 1) * 400ms);
  }

  &[data-swiping] {
    transition-duration: 0ms;
  }
`

export const Viewport = styled(BaseDrawer.Viewport)`
  position: fixed;
  inset: 0;
  z-index: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  pointer-events: none;

  & > * {
    pointer-events: auto;
  }
`

export const Popup = styled(BaseDrawer.Popup)`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  /* Definite max height so flex children can shrink and scroll inside */
  height: auto;
  max-height: 90dvh;
  overflow: hidden;
  border-radius: var(${UI.BORDER_RADIUS_LARGE}) var(${UI.BORDER_RADIUS_LARGE}) 0 0;
  background: var(${UI.COLOR_PAPER});
  color: var(${UI.COLOR_TEXT});
  box-shadow: var(${UI.BOX_SHADOW});
  outline: none;
  transform: translateY(calc(var(--drawer-swipe-movement-y, 0px)));
  transition: transform ${DRAWER_TRANSITION_DURATION} ${DRAWER_TRANSITION_EASING};

  &[data-starting-style],
  &[data-ending-style] {
    transform: translateY(100%);
  }

  &[data-ending-style] {
    transition-duration: calc(var(--drawer-swipe-strength, 1) * 400ms);
  }

  &[data-swiping] {
    transition-duration: 0ms;
  }
`

export const Handle = styled.div`
  flex-shrink: 0;
  align-self: center;
  display: block;
  width: 36px;
  height: 4px;
  margin: 10px 0 4px;
  border-radius: 999px;
  background: var(${UI.COLOR_TEXT_OPACITY_25});
`

export const VisuallyHiddenTitle = styled(BaseDrawer.Title)`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`
