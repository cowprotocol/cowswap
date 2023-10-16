import styled from 'styled-components/macro'

import { UI } from 'common/constants/theme'

export const Header = styled.div`
  display: flex;
  gap: 5px;
  flex-direction: row;
  align-items: center;

  > h4 {
    font-size: 14px;
    font-weight: 500;
    margin: 0;
  }
`

export const TokensList = styled.div`
  margin: 10px 0;
`

export const TokensItem = styled.button`
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  justify-content: center;
  min-width: 140px;
  margin: 5px 5px 5px 0;
  background: none;
  outline: none;
  padding: 6px 0;
  border-radius: 10px;
  color: var(${UI.COLOR_TEXT1});
  border: 1px solid var(${UI.COLOR_GREY});
  font-weight: 500;
  font-size: 16px;
  cursor: ${({ disabled }) => (disabled ? '' : 'pointer')};
  background-color: ${({ theme, disabled }) => disabled && theme.bg3};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};

  :hover {
    background-color: ${({ theme, disabled }) => !disabled && theme.bg4};
  }

  > img {
    --size: 24px;
    width: var(--size);
    height: var(--size);
    border-radius: 50%;
    background: var(${UI.COLOR_LIGHT_BLUE});
  }
`
