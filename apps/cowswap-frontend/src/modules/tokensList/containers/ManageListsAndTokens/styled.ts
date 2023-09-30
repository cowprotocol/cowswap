import styled from 'styled-components/macro'

import { UI } from 'common/constants/theme'

export const Wrapper = styled.div`
  display: block;
  width: 100%;
  background: var(${UI.COLOR_CONTAINER_BG_01});
  border-radius: 20px;
`

export const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  font-weight: 500;
  font-size: 20px;
  padding: 20px;
`

export const TabsContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-shrink: 0;

  > button {
    width: 50%;
  }
`

export const Tab = styled.button<{ active$: boolean }>`
  color: var(${UI.COLOR_TEXT1});
  opacity: ${({ active$ }) => (active$ ? 1 : 0.5)};
  background: none;
  padding: 10px;
  margin: 0;
  outline: none;
  border: 0;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;

  &:hover {
    color: var(${UI.COLOR_TEXT2});
  }
`
