import { WALL_PAINT_MIX_BLEND_MODE } from '@cowprotocol/common-const'
import { Media } from '@cowprotocol/ui'

import { Link } from 'react-router'
import styled, { css, keyframes } from 'styled-components/macro'

import { APP_BOTTOM_BAR_PX, HERO_BREAKPOINT_PX, NARROW_BREAKPOINT_PX } from './wall.constants'

/**
 * The wall has its own fixed dark palette rather than the app's theme tokens.
 *
 * The canvas is literally a black wall of pixels, and the surrounding chrome is
 * styled to disappear into it. Following the light theme would put white chrome
 * around a black wall, so these colours are deliberately theme-independent.
 */
export const wallColors = {
  neon: '#00ffa3',
  neonAlt: '#00d0ff',
  danger: '#ff5577',
  dangerSoft: '#ff5c8a',
  text: '#e8e8f0',
  textMuted: '#8a8aa3',
  textFaint: '#5b5b72',
  border: '#2a2a40',
  borderSubtle: '#1d1d2e',
  surface: '#151524',
  surfaceDeep: '#10101c',
  backdrop: 'rgba(10,10,18,0.85)',
} as const

export const neonShadow = `0 0 12px rgba(0,255,163,0.55)`

/** Phones: the tools become a bottom sheet and the wall takes the screen. */
export const onNarrow = (inner: ReturnType<typeof css>): ReturnType<typeof css> => css`
  @media (max-width: ${NARROW_BREAKPOINT_PX}px) {
    ${inner}
  }
`

/** Widths where the mural stacks above the copy instead of sitting beside it. */
export const onStacked = (inner: ReturnType<typeof css>): ReturnType<typeof css> => css`
  @media (max-width: ${HERO_BREAKPOINT_PX}px) {
    ${inner}
  }
`

/**
 * Widths where the app's wallet bar is fixed over the bottom of the viewport.
 * It covers this width's whole band, so it must come after `onNarrow` to win.
 */
export const onAppBottomBar = (inner: ReturnType<typeof css>): ReturnType<typeof css> => css`
  ${Media.upToMedium()} {
    ${inner}
  }
`

const monospace = `'IBM Plex Mono', 'Fira Mono', ui-monospace, monospace`

export const Page = styled.div<{ $auto?: boolean }>`
  position: relative;
  width: 100%;
  /*
   * The wall takes its height from the shell, via align-self. A percentage
   * height cannot work here: the body's height comes from flex layout, so there
   * is nothing for it to resolve against, and a non-auto cross size also opts
   * the item out of stretching at all.
   */
  height: auto;
  align-self: ${({ $auto }) => ($auto ? 'auto' : 'stretch')};
  flex: 1 1 auto;
  min-height: ${({ $auto }) => ($auto ? '480px' : '0')};
  display: flex;
  flex-direction: column;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  overflow: hidden;
  color: ${wallColors.text};
  font-family: ${monospace};
  /*
   * Transparent so the CoW Swap page background shows through the wall, and
   * without a z-index: a stacking context here would isolate the paint layer's
   * blend mode from that background.
   */
  background: transparent;

  ${onAppBottomBar(css`
    padding-bottom: ${APP_BOTTOM_BAR_PX}px;
  `)}
`

export const Header = styled.header`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  padding: 10px 16px;
  border-bottom: 1px solid ${wallColors.borderSubtle};
  background: ${wallColors.backdrop};
  backdrop-filter: blur(6px);

  ${onNarrow(css`
    flex-wrap: nowrap;
    gap: 8px;
    padding: 6px 12px;
    overflow: hidden;
    white-space: nowrap;
  `)}
`

export const Logo = styled.span`
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  white-space: nowrap;
  color: ${wallColors.neon};
  text-shadow: 0 0 14px rgba(0, 255, 163, 0.8);

  /* The only part of the row that gives up width on a phone, by ellipsis rather than overflow. */
  ${onNarrow(css`
    font-size: 14px;
    letter-spacing: 1px;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  `)}
`

const tagBase = css`
  font-size: 11px;
  letter-spacing: 1px;
  color: ${wallColors.textMuted};
`

/** The header's wall facts. Dropped on phones, where the row fits only the logo and the live state. */
export const Tag = styled.span`
  ${tagBase};

  ${onNarrow(css`
    display: none;
  `)}
`

export const LiveTag = styled.span`
  ${tagBase};
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
`

/** The live tag's sequence number, dropped on phones so the status itself fits. */
export const SeqTag = styled.span`
  ${onNarrow(css`
    display: none;
  `)}
`

export const Spacer = styled.span`
  flex: 1;
`

export const Dot = styled.span<{ $live: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  background: ${({ $live }) => ($live ? wallColors.neon : '#ffb800')};
  box-shadow: 0 0 8px ${({ $live }) => ($live ? wallColors.neon : '#ffb800')};
`

export const Main = styled.div`
  flex: 1;
  display: flex;
  min-height: 0;

  ${onNarrow(css`
    flex-direction: column;
    position: relative;
    flex: 1 1 auto;
  `)}
`

export const CanvasWrap = styled.div`
  flex: 1;
  position: relative;
  min-height: 0;
  cursor: crosshair;
  touch-action: none;

  ${onNarrow(css`
    width: 100%;
    height: auto;
    min-height: 0;
    flex: 1 1 auto;
  `)}
`

export const Canvas = styled.canvas<{ $cursor: string }>`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  cursor: ${({ $cursor }) => $cursor};
`

/** Wall pixels only, under `Canvas`, so it can blend with the page background. */
export const PaintCanvas = styled.canvas`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
  mix-blend-mode: ${WALL_PAINT_MIX_BLEND_MODE};
`

export const Sidebar = styled.aside`
  width: 264px;
  padding: 16px;
  border-left: 1px solid ${wallColors.borderSubtle};
  background: rgba(12, 12, 20, 0.92);
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;

  ${onNarrow(css`
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    max-height: 60dvh;
    overflow-y: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
    touch-action: pan-y;
    z-index: 8;
    border-left: none;
    border-top: 1px solid ${wallColors.border};
    border-radius: 14px 14px 0 0;
    background: rgba(16, 16, 28, 0.96);
    backdrop-filter: blur(8px);
  `)}
`

export const SectionTitle = styled.p`
  margin: 0;
  font-size: 11px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: ${wallColors.textMuted};
`

export const SwatchGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
  margin-top: 8px;
`

export const Swatch = styled.button<{ $color: string; $selected: boolean }>`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 6px;
  padding: 0;
  cursor: pointer;
  background: ${({ $color }) => $color};
  border: 2px solid ${({ $selected }) => ($selected ? '#ffffff' : 'rgba(255,255,255,0.15)')};
  transition: transform 0.1s ease;

  &:hover {
    transform: scale(1.08);
  }
`

const buttonBase = css`
  border-radius: 8px;
  border: 1px solid ${wallColors.border};
  background: transparent;
  color: ${wallColors.text};
  padding: 8px 12px;
  font-family: inherit;
  font-size: 13px;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background 0.15s ease;

  &:hover:not(:disabled) {
    border-color: ${wallColors.neon};
    background: rgba(0, 255, 163, 0.08);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`

export const Button = styled.button`
  ${buttonBase};
`

/** `Button` for a destination rather than an action, so both read the same. */
export const ButtonLink = styled(Link)`
  ${buttonBase};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  text-decoration: none;
`

/** Body copy inside a panel. `muted` is the default for secondary status lines. */
export const PanelText = styled.p<{ $tone?: 'muted' | 'danger' | 'success' }>`
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: ${({ $tone }) =>
    $tone === 'danger'
      ? wallColors.dangerSoft
      : $tone === 'success'
        ? wallColors.neon
        : $tone === 'muted'
          ? wallColors.textMuted
          : wallColors.text};
  font-weight: ${({ $tone }) => ($tone === 'success' ? 700 : 400)};
`

/** Any link inside a panel: long values wrap rather than overflow the column. */
export const PanelLink = styled.a`
  color: ${wallColors.neonAlt};
  text-decoration: none;
  word-break: break-all;

  &:hover {
    text-decoration: underline;
  }
`

/** The row a panel's secondary controls sit in; each one shares the width. */
export const PanelActions = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;

  > * {
    flex: 1;
  }
`

/** Accent border + glow for the currently selected tool. */
export const ToolButton = styled.button<{ $active: boolean; $accent: string; $tint: boolean }>`
  ${buttonBase};
  border-color: ${({ $active, $accent }) => ($active ? $accent : wallColors.border)};
  ${({ $active, $accent, $tint }) =>
    $active &&
    css`
      box-shadow: 0 0 10px ${$accent}59;
      ${$tint &&
      css`
        color: ${$accent};
      `}
    `};
`

/** The neon pill shared by the wall's primary floating controls. */
export const GlowButton = styled.button`
  ${buttonBase};
  border-radius: 999px;
  border: 1px solid ${wallColors.neon};
  color: ${wallColors.neon};
  font-weight: 700;
  background: linear-gradient(135deg, rgba(0, 255, 163, 0.18), rgba(0, 208, 255, 0.18)), rgba(21, 21, 36, 0.92);
  box-shadow:
    0 0 14px rgba(0, 255, 163, 0.45),
    inset 0 0 8px rgba(0, 255, 163, 0.15);
`

/** `GlowButton` with a leading mark, centred on the label rather than on a baseline. */
export const IconGlowButton = styled(GlowButton)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
`

/**
 * Drawn rather than typed: the `⌄` the monospace stack falls back to for this
 * glyph sits well below the label beside it.
 */
export const ChevronDown = styled.span`
  flex: none;
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 5px solid currentColor;
`

export const DangerButton = styled(Button)`
  border-color: ${wallColors.danger}55;
  color: ${wallColors.danger};

  &:hover:not(:disabled) {
    border-color: ${wallColors.danger};
    background: rgba(255, 85, 119, 0.08);
  }
`

export const PrimaryButton = styled.button`
  width: 100%;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, ${wallColors.neon}, ${wallColors.neonAlt});
  color: #061310;
  font-weight: 700;
  padding: 12px 14px;
  font-family: inherit;
  font-size: 14px;
  letter-spacing: 1px;
  cursor: pointer;
  box-shadow: ${neonShadow};
  transition: filter 0.15s ease;

  &:hover:not(:disabled) {
    filter: brightness(1.1);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`

export const Panel = styled.div`
  border-radius: 14px;
  border: 1px solid ${wallColors.border};
  background: ${wallColors.surface};
  padding: 28px;
`

/** A panel standing alone on a page: it hugs its content rather than stretching. */
export const ModalPanel = styled(Panel)`
  width: fit-content;
  max-width: 100%;
`

/** A page whose only content is one centred panel. */
export const CenteredPage = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 24px;
`

export const CostBox = styled.div<{ $variant?: 'default' | 'danger' | 'success' }>`
  border: 1px solid
    ${({ $variant }) =>
      $variant === 'danger' ? wallColors.danger : $variant === 'success' ? wallColors.neon : wallColors.border};
  border-radius: 10px;
  padding: 10px 12px;
  background: ${wallColors.surfaceDeep};
  color: ${({ $variant }) =>
    $variant === 'danger' ? wallColors.dangerSoft : $variant === 'success' ? wallColors.neon : 'inherit'};
`

export const CostValue = styled.div`
  font-size: 26px;
  font-weight: 700;
  color: ${wallColors.neon};
  text-shadow: ${neonShadow};
`

export const Muted = styled.p`
  margin: 0;
  font-size: 11px;
  color: ${wallColors.textMuted};
`

export const Footer = styled.footer`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 16px;
  min-height: 30px;
  border-top: 1px solid ${wallColors.borderSubtle};
  background: rgba(10, 10, 18, 0.9);
  font-size: 12px;
  color: ${wallColors.textMuted};

  ${onNarrow(css`
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 7;
    min-height: 0;
    padding: 4px 12px;
    border-top: none;
    background: ${wallColors.backdrop};
    pointer-events: none;
  `)}

  /* Absolute against the page's padding box, so the page's own clearance misses it. */
  ${onAppBottomBar(css`
    bottom: ${APP_BOTTOM_BAR_PX}px;
  `)}
`

export const Hints = styled.div`
  margin-top: auto;
  font-size: 11px;
  line-height: 1.6;
  color: ${wallColors.textFaint};
`

/* ---------------- canvas overlays ---------------- */

export const OverlayLayer = styled.div`
  position: absolute;
  inset: 0;
  z-index: 7;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(5, 5, 10, 0.62);
  backdrop-filter: blur(2px);
  pointer-events: none;

  ${onNarrow(css`
    align-items: stretch;
    padding: 8px;
    background: none;
    backdrop-filter: none;
  `)}
`

export const StartPanel = styled(Panel)`
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  min-width: 280px;
  max-height: 100%;
  overflow-y: auto;
  text-align: center;

  /* One column once the mural is on top of the copy, so the lines stay readable. */
  ${onStacked(css`
    max-width: 380px;
  `)}

  /* Phones: a full-screen sheet, laid out by the overlay rather than positioned. */
  ${onNarrow(css`
    flex: 1;
    min-width: 0;
    max-width: none;
    justify-content: center;
    /* Centring a scroll container puts overflow out of reach; safe falls back to the start. */
    justify-content: safe center;
    padding: 16px 12px;
    /* Opaque: a full-screen sheet otherwise ghosts the canvas controls underneath it. */
    background: ${wallColors.surfaceDeep};
  `)}
`

export const PlotOverlayRoot = styled.div`
  position: absolute;
  z-index: 6;
  display: flex;
  gap: 8px;
  align-items: center;
  pointer-events: none;
`

export const BalanceChip = styled.div`
  border-radius: 999px;
  border: 1px solid ${wallColors.neon};
  color: ${wallColors.neon};
  font-weight: 700;
  font-family: inherit;
  font-size: 14px;
  padding: 7px 15px;
  background: linear-gradient(135deg, rgba(0, 255, 163, 0.18), rgba(0, 208, 255, 0.18)), rgba(21, 21, 36, 0.92);
  box-shadow:
    0 0 14px rgba(0, 255, 163, 0.45),
    inset 0 0 8px rgba(0, 255, 163, 0.15);
`

export const OverlayButton = styled(GlowButton)`
  pointer-events: auto;
`

export const PlainOverlayButton = styled(Button)`
  pointer-events: auto;
  border-radius: 999px;
`

export const ControlBar = styled.div<{ $hidden: boolean }>`
  position: absolute;
  left: 12px;
  bottom: 12px;
  display: ${({ $hidden }) => ($hidden ? 'none' : 'flex')};
  gap: 6px;
  flex-wrap: wrap;
  max-width: calc(100% - 24px);
`

export const ShowTools = styled(GlowButton)`
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 5;
  padding: 8px 16px;
`

export const LoadError = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 24px;
  text-align: center;
  font-size: 14px;
  color: ${wallColors.dangerSoft};
  background: rgba(6, 6, 9, 0.9);
`

const pulse = keyframes`
  to { opacity: 0.45; }
`

/** Bottom-sheet grabber, shown on phones only. */
export const SheetHandleRow = styled.div`
  display: none;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 2px 0 8px;

  ${onNarrow(css`
    display: flex;
  `)}
`

export const SheetGrabber = styled.div`
  width: 44px;
  height: 4px;
  border-radius: 2px;
  background: #3a3a55;
  animation: ${pulse} 1.6s ease-in-out infinite alternate;
`

export const TextInput = styled.input`
  ${buttonBase};
  width: 100%;
  background: #0d0d18;
  text-align: left;
  user-select: text;
  -webkit-user-select: text;
  cursor: text;
`

export const ColorRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
`

export const ColorPicker = styled.input`
  width: 44px;
  height: 32px;
  background: none;
  border: none;
  cursor: pointer;
`

export const BrushRange = styled.input`
  width: 100%;
  accent-color: ${wallColors.neon};
`

export const ButtonRow = styled.div`
  display: flex;
  gap: 8px;

  > * {
    flex: 1;
  }
`

export const WallHeading = styled.h2`
  margin: 0;
  letter-spacing: 2px;
  color: #fff;
`

export const BigEmoji = styled.span<{ $size?: number }>`
  font-size: ${({ $size }) => $size ?? 40}px;
`

export const UnitLabel = styled.span`
  font-size: 13px;
  color: ${wallColors.textMuted};
`

export const ErrorNote = styled.p`
  margin: 6px 0 0;
  color: #ff9cb8;
`
