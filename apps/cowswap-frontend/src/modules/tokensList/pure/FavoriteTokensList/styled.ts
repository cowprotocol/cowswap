import { HelpTooltip, Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Section = styled.div`
  padding: 0 14px 14px;

  ${Media.upToSmall()} {
    padding: 8px 14px 4px;
  }
`

export const TitleRow = styled.div`
  display: flex;
  align-items: center;
`

export const Title = styled.h4`
  font-size: 14px;
  font-weight: 500;
  margin: 0;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

export const List = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding-top: 10px;

  ${Media.upToSmall()} {
    width: 0;
    min-width: 100%;
    flex-wrap: nowrap;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 10px 0;
    -webkit-overflow-scrolling: touch;

    @media (hover: hover) {
      ${({ theme }) => theme.colorScrollbar};
    }

    @media (hover: none) {
      scrollbar-width: none;
      &::-webkit-scrollbar {
        display: none;
      }
    }
  }
`

export const TokenButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
  background: none;
  outline: none;
  padding: 6px 10px;
  border-radius: 10px;
  color: inherit;
  border: 1px solid var(${UI.COLOR_PAPER_DARKER});
  font-weight: 500;
  font-size: 16px;
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  background: ${({ disabled }) => (disabled ? `var(${UI.COLOR_PAPER_DARKER})` : 'transparent')};
  opacity: ${({ disabled }) => (disabled ? 0.65 : 1)};
  transition: border var(${UI.ANIMATION_DURATION}) ease-in-out;
  white-space: nowrap;

  ${Media.upToSmall()} {
    flex: 0 0 auto;
  }

  :hover {
    border: 1px solid ${({ disabled }) => (disabled ? `var(${UI.COLOR_PAPER_DARKER})` : `var(${UI.COLOR_PRIMARY})`)};
  }
`

export const FavoriteTooltip = styled(HelpTooltip)`
  color: var(${UI.COLOR_TEXT_OPACITY_50});
  transition: color 0.2s ease-in-out;
  margin-left: 6px;

  &:hover {
    color: var(${UI.COLOR_TEXT});
  }
`
