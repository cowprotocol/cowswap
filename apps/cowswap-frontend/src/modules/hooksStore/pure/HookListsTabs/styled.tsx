import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const TabsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin: 16px 0 10px;
  border-bottom: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
`

export const Tab = styled.button<{ active$: boolean }>`
  background: none;
  margin: 0;
  outline: none;
  border: 0;
  cursor: pointer;
  color: ${({ active$ }) => (active$ ? 'var(' + UI.COLOR_INFO + ')' : 'var(' + UI.COLOR_TEXT + ')')};
  opacity: ${({ active$ }) => (active$ ? 1 : 0.5)};
  padding: 14px 16px;
  font-size: 15px;
  font-weight: 600;
  position: relative;
  transition: all 0.2s ease-in-out;
  border-radius: 5px;
  flex: 1 1 auto;

  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: var(${UI.COLOR_INFO});
    opacity: ${({ active$ }) => (active$ ? 1 : 0)};
    transition: all 0.2s ease-in-out;
  }

  &:hover {
    opacity: 1;
    background-color: var(${UI.COLOR_PRIMARY_OPACITY_10});
  }

  &:disabled {
    cursor: default;
  }
`
