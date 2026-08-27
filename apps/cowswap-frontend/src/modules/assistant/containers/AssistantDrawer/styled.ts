import { Media, UI } from '@cowprotocol/ui'

import { transparentize } from 'color2k'
import styled from 'styled-components/macro'

const DRAWER_WIDTH = '408px'

/**
 * A right-hand drawer that OVERLAYS the page rather than shifting it.
 *
 * Nothing behind it moves, so the trade form can't be pushed into a broken layout
 * at any width — and the closed state is genuinely identical to the app today.
 *
 * Below the app's `upToMedium` breakpoint it becomes a full-screen sheet: there
 * isn't room to sit beside a centred trade form, and the assistant taking over the
 * screen while you talk to it is a reasonable phone interaction rather than a
 * compromise. Anatomy follows modules/account's OrdersPanel.
 */
export const Drawer = styled.aside`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  /**
   * Above the app's floating chrome. The cow speech bubble sets z-index 2 but wins
   * against a lower value from its own stacking context, and it sits bottom-right —
   * exactly where the composer is — so it covered the input.
   */
  z-index: 10;
  display: flex;
  flex-flow: column nowrap;
  width: ${DRAWER_WIDTH};
  max-width: 100%;
  background: var(${UI.COLOR_PAPER});
  border-left: 1px solid var(${UI.COLOR_PAPER_DARKER});
  box-shadow: var(${UI.BOX_SHADOW});

  ${Media.upToMedium()} {
    width: 100%;
    border-left: 0;
  }
`

/**
 * Only below the breakpoint, where the drawer is modal. On a wide screen the page
 * behind stays fully usable — you can read the form while talking about it, which
 * is the entire point of a drawer rather than a modal.
 */
export const Scrim = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9;
  display: none;
  background: ${({ theme }) => transparentize(theme.black, 0.3)};
  backdrop-filter: blur(3px);

  ${Media.upToMedium()} {
    display: block;
  }
`

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  gap: 12px;
  padding: 18px 20px;
  border-bottom: 1px solid var(${UI.COLOR_PAPER_DARKER});

  > strong {
    display: flex;
    align-items: center;
    gap: 9px;
    font-size: 16px;
    color: inherit;
  }
`

/**
 * ⚠️ The `position: relative` here is load-bearing.
 *
 * The ::before widens the hit area with negative insets (copied from OrdersPanel).
 * Without a positioned ancestor of its own, that pseudo-element anchors to the
 * nearest one — the drawer — which made the close button's invisible hit area the
 * entire panel, so any click anywhere closed it.
 */
export const CloseButton = styled.button`
  position: relative;
  display: flex;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  opacity: 0.6;
  cursor: pointer;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    opacity: 1;
  }

  /* Widens the hit area past the glyph without moving anything. */
  &::before {
    content: '';
    position: absolute;
    inset: -18px -20px;
  }
`

export const Messages = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-flow: column nowrap;
  gap: 12px;
  padding: 20px;
  overflow-y: auto;
  ${({ theme }) => theme.colorScrollbar};
`

export const Message = styled.div<{ from: 'assistant' | 'user' }>`
  max-width: 88%;
  padding: 10px 13px;
  border-radius: 14px;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  align-self: ${({ from }) => (from === 'user' ? 'flex-end' : 'flex-start')};
  background: ${({ from }) =>
    from === 'user' ? `var(${UI.COLOR_PRIMARY_OPACITY_25})` : `var(${UI.COLOR_PAPER_DARKER})`};
  border-top-left-radius: ${({ from }) => (from === 'assistant' ? '4px' : '14px')};
  border-top-right-radius: ${({ from }) => (from === 'user' ? '4px' : '14px')};
`

// Deliberately quiet: starting over is occasionally useful and never the point of
// opening the panel, so it sits beside the title rather than competing with it.
export const ResetButton = styled.button`
  margin-left: auto;
  margin-right: 4px;
  padding: 4px 8px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  font: inherit;
  font-size: 13px;
  cursor: pointer;

  &:hover {
    background: var(${UI.COLOR_PAPER_DARKER});
    color: inherit;
  }

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`

export const Composer = styled.form`
  display: flex;
  /* flex-end, not center: the buttons stay level with the last line as the box
     grows, rather than drifting to the middle of a tall input. */
  align-items: flex-end;
  flex-shrink: 0;
  gap: 8px;
  padding: 14px 20px;
  border-top: 1px solid var(${UI.COLOR_PAPER_DARKER});
`

// A textarea rather than an input so a long request stays readable while it's being
// written. A single-line input scrolls its own start out of view, which is worst
// exactly when it matters most: dictation, where you didn't type the words and are
// reading them back to check the numbers landed. Height is assigned from content by
// the composer — see growToFit — and bounded by the min/max here.
export const Input = styled.textarea`
  flex: 1 1 auto;
  min-width: 0;
  /* One line: 20px of text plus 10px padding each side, matching the 40px buttons. */
  min-height: 40px;
  /* About six lines, then it scrolls — past that the drawer has nowhere to give. */
  max-height: 140px;
  padding: 10px 13px;
  border: 1px solid var(${UI.COLOR_PAPER_DARKER});
  border-radius: 14px;
  background: var(${UI.COLOR_PAPER_DARKER});
  color: inherit;
  font: inherit;
  font-size: 14px;
  line-height: 20px;
  outline: none;
  resize: none;
  overflow-y: auto;

  &::placeholder {
    color: var(${UI.COLOR_TEXT_OPACITY_50});
  }

  &:focus {
    border-color: var(${UI.COLOR_PRIMARY_OPACITY_50});
  }
`

export const SendButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: 14px;
  background: var(${UI.COLOR_PRIMARY});
  color: var(${UI.COLOR_BUTTON_TEXT});
  cursor: pointer;

  &:disabled {
    opacity: 0.45;
    cursor: default;
  }
`

export const Thinking = styled.div`
  align-self: flex-start;
  padding: 10px 13px;
  border-radius: 14px;
  border-top-left-radius: 4px;
  background: var(${UI.COLOR_PAPER_DARKER});
  color: var(${UI.COLOR_TEXT_OPACITY_60});
  font-size: 13px;
`

export const ErrorMessage = styled.div`
  padding: 10px 13px;
  border: 1px solid var(${UI.COLOR_DANGER});
  border-radius: 14px;
  background: var(${UI.COLOR_DANGER_BG});
  color: var(${UI.COLOR_DANGER_TEXT});
  font-size: 13px;
  line-height: 1.5;
`

export const MicButton = styled(SendButton)<{ isListening: boolean }>`
  background: ${({ isListening }) => (isListening ? `var(${UI.COLOR_PRIMARY})` : `var(${UI.COLOR_PAPER_DARKER})`)};
  color: ${({ isListening }) => (isListening ? `var(${UI.COLOR_BUTTON_TEXT})` : `var(${UI.COLOR_TEXT_OPACITY_70})`)};
  border: 1px solid var(${UI.COLOR_PAPER_DARKER});
`
