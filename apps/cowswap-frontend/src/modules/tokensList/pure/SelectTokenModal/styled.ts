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
  margin: 0 20px 15px 20px;
`

export const Separator = styled.div`
  width: 100%;
  border-bottom: 1px solid var(${UI.COLOR_BORDER});
`

export const Header = styled.div`
  display: flex;
  flex-direction: row;
  padding: 20px 20px 0 20px;
  margin-bottom: 15px;

  > h3 {
    font-size: 16px;
    font-weight: 500;
    margin: 0;
  }
`

export const SearchInput = styled.input`
  position: relative;
  display: flex;
  padding: 16px;
  align-items: center;
  width: 100%;
  white-space: nowrap;
  outline: none;
  background: var(${UI.COLOR_PAPER_DARKER});
  color: inherit;
  border: 1px solid var(${UI.COLOR_BORDER});
  appearance: none;
  font-size: 16px;
  border-radius: 12px;

  ::placeholder {
    color: inherit;
    opacity: 0.7;
  }

  transition: border 100ms;

  :focus {
    border: 1px solid var(${UI.COLOR_PRIMARY});
    outline: none;
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
