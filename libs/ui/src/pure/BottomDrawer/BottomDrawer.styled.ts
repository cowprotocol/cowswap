import { Drawer as BaseDrawer } from '@base-ui/react/drawer'
import styled from 'styled-components/macro'

import { OVERLAY_Z_INDEX } from '../../consts'
import { UI } from '../../enum'
import { transition } from '../../utils/animation'

/** Matches Base UI drawer demos: duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] */
const DRAWER_TRANSITION_DURATION = '450ms'
const DRAWER_TRANSITION_EASING = 'cubic-bezier(0.32, 0.72, 0, 1)'

export const Backdrop = styled(BaseDrawer.Backdrop)`
  position: fixed;
  inset: 0;
  z-index: ${OVERLAY_Z_INDEX.drawerBackdrop};
  background-color: var(${UI.MODAL_BACKDROP});
  --backdrop-opacity: 0.4;
  opacity: calc(var(--backdrop-opacity) * (1 - var(--drawer-swipe-progress, 0)));
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
  z-index: ${OVERLAY_Z_INDEX.drawerViewport};
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

/** Stable header chrome outside the scrollable body (handle / optional title row). */
export const Header = styled.div`
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`

export const Handle = styled.div`
  flex-shrink: 0;
  align-self: center;
  width: 36px;
  height: 4px;
  margin: 10px 0 4px;
  border-radius: 999px;
  background: var(${UI.COLOR_TEXT_OPACITY_25});
`

/* Opt scroll body out of swipe-to-dismiss so vertical touch scrolling works */
export const Content = styled(BaseDrawer.Content).attrs({
  'data-base-ui-swipe-ignore': '',
})`
  ${({ theme }) => theme.colorScrollbar};

  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  max-height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  transform: translateZ(0);
`

/**
 * Reserves space for a pinned footer below the scroll area.
 * Grows by --drawer-keyboard-inset when the keyboard is open (always include the 0px fallback).
 */
export const FooterSlot = styled.div`
  --footer-reserved-height: 0px;
  position: relative;
  flex-shrink: 0;
  min-height: var(--footer-reserved-height);
  transition: ${transition(['min-height'])};

  &:focus-within {
    min-height: calc(var(--footer-reserved-height) + var(--drawer-keyboard-inset, 0px));
  }
`

/**
 * Pinned footer surface. On focus-within, lifts above the keyboard using
 * position:fixed against the transformed popup + --drawer-keyboard-inset padding.
 */
export const StickyFooter = styled.div`
  box-sizing: border-box;
  width: 100%;
  background: var(${UI.COLOR_PAPER});
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + var(--drawer-keyboard-inset, 0px));
  transition: ${transition(['padding-bottom'])};

  ${FooterSlot}:focus-within & {
    position: fixed;
    z-index: 3;
    right: 0;
    bottom: 0;
    left: 0;
    /* Contain fixed descendants inside the transformed popup */
    transform: translate3d(0, 0, 0);
  }
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
