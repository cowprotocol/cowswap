import { Media, UI } from '@cowprotocol/ui'

import { transparentize } from 'color2k'
import { Link } from 'react-router'
import styled, { css } from 'styled-components/macro'

export const PaginationBox = styled.div`
  width: 100%;
  display: flex;
  overflow-x: auto;
  text-align: center;
  margin: 20px auto 0;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;

  ${Media.upToSmall()} {
    justify-content: flex-start;
  }
`
const pageButtonStyles = css<{ $active?: boolean }>`
  background: ${({ theme, $active }) => ($active ? transparentize(theme.info, 0.9) : 'transparent')};
  color: ${({ $active }) => ($active ? `var(${UI.COLOR_TEXT})` : `var(${UI.COLOR_TEXT_OPACITY_25})`)};
  border: 0;
  outline: 0;
  padding: 5px 6px;
  border-radius: 4px;
  width: 34px;
  margin: 0 5px;
  cursor: pointer;
  transition: background var(${UI.ANIMATION_DURATION}) ease-in-out, color var(${UI.ANIMATION_DURATION}) ease-in-out;
  text-decoration: none;

  &:hover {
    background: var(${UI.COLOR_PAPER});
    color: inherit;
  }
`
export const PageButtonLink = styled(Link)`
  ${pageButtonStyles}
`
export const PageButton = styled.div`
  ${pageButtonStyles}
`
export const BlankButton = styled(PageButton)`
  cursor: default;

  &:hover {
    background: transparent !important;
    color: var(${UI.COLOR_TEXT_OPACITY_25}) !important;
  }
`
export const ArrowButton = styled.button`
  ${pageButtonStyles};
  width: 30px;
  height: 30px;
  text-align: center;
  margin: 0 5px;
  padding: 0;
  line-height: 0;
  border: 1px solid var(${UI.COLOR_TEXT_OPACITY_25});
`
