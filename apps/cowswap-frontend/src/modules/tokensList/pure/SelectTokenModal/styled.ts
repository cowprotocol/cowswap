import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { blankButtonMixin } from '../commonElements'

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  background: var(${UI.COLOR_PAPER});
  border-radius: 20px;
  width: 100%;
`

export const Row = styled.div`
  margin: 0 20px 20px;
`

export const ChainsSelectorWrapper = styled.div`
  border-bottom: 1px solid var(${UI.COLOR_BORDER});
  padding: 2px 16px 10px 20px;
  margin-bottom: 20px;
`

export const Separator = styled.div`
  width: 100%;
  border-bottom: 1px solid var(${UI.COLOR_BORDER});
`

export const Header = styled.div`
  display: flex;
  flex-direction: row;
  padding: 10px 16px;
  margin-bottom: 8px;
  align-items: center;
  border-bottom: 1px solid var(${UI.COLOR_BORDER});

  > h3 {
    font-size: 16px;
    font-weight: 500;
    margin: 0;
  }
`

export const ActionButton = styled.button`
  ${blankButtonMixin};

  display: flex;
  width: 100%;
  align-items: center;
  flex-direction: row;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  padding: 20px 0;
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: inherit;
  opacity: 0.6;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    opacity: 1;
  }
`

export const TokensLoader = styled.div`
  width: 100%;
  height: 100%;
  overflow: auto;
  padding: 20px 0;
  text-align: center;
`
