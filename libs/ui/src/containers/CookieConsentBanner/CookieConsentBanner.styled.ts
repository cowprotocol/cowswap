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
  color: var(${UI.COLOR_TEXT_OPACITY_70});
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
  color: var(${UI.COLOR_TEXT_OPACITY_70});

  > a {
    color: var(${UI.COLOR_TEXT});
    text-decoration: underline;
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
  min-height: 44px;
  padding: 10px 16px;
  border-radius: 12px;
  ${font('FONT_MEDIUM', 'semibold')}
`

export const Card = styled.section<{ $isCowCookie: boolean }>`
  display: flex;
  flex-flow: column nowrap;
  gap: 16px;
  width: 100%;
  max-width: 400px;
  padding: 20px;
  border: 1px solid var(${UI.COLOR_BORDER});
  border-radius: 16px;
  background: var(${UI.COLOR_PAPER});
  box-shadow: var(${UI.BOX_SHADOW});
  color: var(${UI.COLOR_TEXT});
  pointer-events: auto;

  &:focus {
    outline: none;
  }

  &:focus-visible {
    outline: 2px solid var(${UI.COLOR_PRIMARY});
    outline-offset: 2px;
  }

  ${Media.upToMedium()} {
    max-width: 640px;
  }

  ${Media.upToExtraSmall()} {
    padding: 16px;
  }

  ${({ $isCowCookie }) =>
    $isCowCookie &&
    css`
      max-width: 440px;
      padding: 24px;
      border: 0;
      background: ${Color.blue300Primary};
      color: ${Color.cowfi_darkBlue};

      &:focus-visible {
        outline-color: ${Color.cowfi_darkBlue};
      }

      ${CloseButton},
      ${Message},
      ${Message} > a {
        color: ${Color.cowfi_darkBlue};
      }

      ${Message} > a {
        display: block;
        width: fit-content;
        margin-top: 8px;
        text-underline-offset: 3px;
      }

      ${ChoiceButton} {
        min-height: 48px;
        padding: 12px 16px;
        background: ${Color.cowfi_darkBlue};
        color: ${Color.blue300Primary};
        ${font('FONT_NORMAL', 'semibold')}

        &:hover,
        &:focus,
        &:active {
          background: ${Color.cowfi_darkBlue2};
          color: ${Color.blue300Primary};
        }
      }

      ${ChoiceButton}:focus-visible,
      ${CloseButton}:focus-visible,
      ${Message} > a:focus-visible {
        outline: 2px solid ${Color.cowfi_darkBlue};
        outline-offset: 3px;
      }

      ${Media.upToMedium()} {
        max-width: 440px;
      }

      ${Media.upToExtraSmall()} {
        padding: 16px;
      }
    `}
`
