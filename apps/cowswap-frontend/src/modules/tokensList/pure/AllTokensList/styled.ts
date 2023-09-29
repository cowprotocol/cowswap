import styled from 'styled-components/macro'

import { UI } from 'common/constants/theme'

export const Wrapper = styled.div`
  border-top: 1px solid var(${UI.COLOR_BORDER});
  border-bottom: 1px solid var(${UI.COLOR_BORDER});
`

export const TokenItem = styled.button`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  background: none;
  border: 0;
  outline: none;
  color: var(${UI.COLOR_TEXT1});
  cursor: pointer;
  font-size: 16px;
  padding: 10px 20px;
  margin-bottom: 10px;
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    background-color: ${({ disabled }) => !disabled && `var(${UI.COLOR_GREY})`};
  }
`

export const TokenLogo = styled.img`
  --size: 36px;
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  background: var(${UI.COLOR_LIGHT_BLUE});
`

export const TokenInfo = styled.div`
  display: flex;
  flex-direction: row;
  text-align: left;
  gap: 16px;
  font-weight: 500;
`

export const TokenName = styled.div`
  font-size: 12px;
  font-weight: 400;
  color: var(${UI.COLOR_TEXT2});
`
