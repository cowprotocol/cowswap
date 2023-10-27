import { transparentize } from 'polished'
import styled from 'styled-components/macro'

import { UI } from 'common/constants/theme'

import { blankButtonMixin } from '../../pure/commonElements'

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  background: var(${UI.COLOR_CONTAINER_BG_01});
  border-radius: 20px;
`

export const TabsContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  margin-top: 10px;

  > button {
    width: 50%;
  }
`

export const InputError = styled.div`
  margin-top: 20px;
  color: var(${UI.COLOR_RED});
  font-weight: 500;
`

export const Tab = styled.button<{ active$: boolean }>`
  ${blankButtonMixin};

  color: var(${UI.COLOR_TEXT1});
  opacity: ${({ active$ }) => (active$ ? 1 : 0.5)};
  padding: 10px;
  font-size: 16px;
  font-weight: 600;

  &:hover {
    color: var(${UI.COLOR_TEXT2});
  }
`

export const PrimaryInputBox = styled.div`
  margin: 10px 0 0 0;
  padding: 0 20px 20px 20px;
  border-bottom: 1px solid var(${UI.COLOR_GREY});
`

export const PrimaryInput = styled.input`
  width: 100%;
  border: none;
  background: var(${UI.COLOR_GREY});
  font-size: 18px;
  border-radius: 20px;
  padding: 16px;
  color: var(${UI.COLOR_TEXT1});
  outline: none;

  ::placeholder {
    color: var(${UI.COLOR_TEXT1});
  }

  &:focus {
    ::placeholder {
      color: ${({ theme }) => transparentize(0.7, theme.text1)};
    }
  }
`
