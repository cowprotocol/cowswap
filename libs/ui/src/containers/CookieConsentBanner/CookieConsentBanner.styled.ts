import styled, { css } from 'styled-components/macro'

import { Color } from '../../colors'
import { Media, OVERLAY_Z_INDEX } from '../../consts'
import { UI } from '../../enum'
import { ButtonPrimary } from '../../pure/Button'
import { LinkStyledButton } from '../../pure/LinkStyledButton'
import { font } from '../../utils/font'

export const Wrapper = styled.div<{ $bottomBarHeight: number }>`
  position: fixed;
  right: 16px;
  bottom: 16px;
  left: 16px;
  z-index: ${OVERLAY_Z_INDEX.overlay - 1};
  display: flex;
  justify-content: flex-end;
  pointer-events: none;

  ${Media.upToMedium()} {
    bottom: ${({ $bottomBarHeight }) => $bottomBarHeight + 16}px;
    justify-content: center;
  }

  ${Media.upToExtraSmall()} {
    right: 8px;
    bottom: ${({ $bottomBarHeight }) => $bottomBarHeight + 8}px;
    left: 8px;
  }
`

export const Header = styled.div`
  display: flex;
  justify-content: flex-end;
`

export const CloseButton = styled(LinkStyledButton)`
  ${font('FONT_SMALL_PLUS', 'medium')}
  color: var(--cookie-banner-text);
  text-decoration: underline;
`

export const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`

export const Title = styled.h2`
  margin: 0;
  max-width: 14ch;
  ${font('FONT_TITLE', 'bold')}
  letter-spacing: -0.025em;
  text-wrap: balance;

  ${Media.upToExtraSmall()} {
    max-width: none;
    ${font('FONT_LARGEST', 'bold')}
  }
`

export const Illustration = styled.div`
  flex: 0 0 96px;
  width: 96px;
  height: 80px;
  pointer-events: none;
  user-select: none;

  > img,
  > svg {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  ${Media.upToExtraSmall()} {
    display: none;
  }
`

export const Message = styled.p`
  margin: 0;
  ${font('FONT_NORMAL')}
  color: var(--cookie-banner-text);

  > a,
  > a:link,
  > a:visited,
  > a:hover,
  > a:focus,
  > a:active {
    color: var(--cookie-banner-text);
    text-decoration: underline;
    text-underline-offset: 3px;
    white-space: nowrap;
  }
`

export const Actions = styled.div`
  display: flex;
  gap: 12px;

  ${Media.upToTiny()} {
    flex-flow: column nowrap;
  }
`

export const ChoiceButton = styled(ButtonPrimary)`
  flex: 1 1 0;
  min-height: 48px;
  padding: 12px 16px;
  border-radius: 12px;
  background: var(--cookie-banner-button);
  ${font('FONT_NORMAL', 'semibold')}

  &:hover,
  &:focus,
  &:active {
    background: var(--cookie-banner-button-hover);
  }
`

export const Card = styled.section<{ $variant: 'white' | 'paleBlue' | 'trading' }>`
  ${({ $variant, theme }) => {
    const darkCard = $variant === 'trading' && !theme.darkMode
    const background =
      $variant === 'trading'
        ? theme.darkMode
          ? Color.blue300Primary
          : Color.cowfi_darkBlue
        : $variant === 'paleBlue'
          ? Color.blue100Primary
          : Color.white

    return css`
      --cookie-banner-background: ${background};
      --cookie-banner-text: ${darkCard ? Color.blue100Primary : Color.cowfi_darkBlue};
      --cookie-banner-button: ${darkCard ? Color.blue300Primary : Color.cowfi_darkBlue};
      --cookie-banner-button-text: ${darkCard
        ? Color.cowfi_darkBlue
        : $variant === 'trading'
          ? Color.blue300Primary
          : Color.white};
      --cookie-banner-button-hover: ${darkCard ? Color.blue200Primary : Color.cowfi_darkBlue2};
    `
  }}

  display: flex;
  flex-flow: column nowrap;
  gap: 16px;
  width: 100%;
  max-width: 440px;
  padding: 24px;
  border: 0;
  border-radius: 16px;
  background: var(--cookie-banner-background);
  box-shadow: var(${UI.BOX_SHADOW});
  color: var(--cookie-banner-text);
  font-family: var(${UI.FONT_FAMILY_PRIMARY});
  pointer-events: auto;

  &:focus {
    outline: none;
  }

  &:focus-visible,
  ${ChoiceButton}:focus-visible, ${CloseButton}:focus-visible, ${Message} > a:focus-visible {
    outline: 2px solid var(--cookie-banner-text);
    outline-offset: 3px;
  }

  ${ChoiceButton},
  ${ChoiceButton}:hover,
  ${ChoiceButton}:focus,
  ${ChoiceButton}:active {
    color: var(--cookie-banner-button-text);
  }

  ${Media.upToExtraSmall()} {
    padding: 16px;
  }
`
