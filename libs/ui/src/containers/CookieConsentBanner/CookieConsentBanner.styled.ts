import styled from 'styled-components/macro'

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
  justify-content: center;
  pointer-events: none;

  ${Media.upToMedium()} {
    bottom: ${({ $bottomBarHeight }) => $bottomBarHeight + 16}px;
  }

  ${Media.upToExtraSmall()} {
    right: 8px;
    bottom: ${({ $bottomBarHeight }) => $bottomBarHeight + 8}px;
    left: 8px;
  }
`

export const Card = styled.section`
  display: flex;
  flex-flow: column nowrap;
  gap: 16px;
  width: 100%;
  max-width: 640px;
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

  ${Media.upToExtraSmall()} {
    padding: 16px;
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
