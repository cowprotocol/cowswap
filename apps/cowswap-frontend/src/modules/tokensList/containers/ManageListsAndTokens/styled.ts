import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { blankButtonMixin } from '../../pure/commonElements'

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  background: var(${UI.COLOR_PAPER});
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
  color: var(${UI.COLOR_DANGER});
  font-weight: 500;
`

export const Tab = styled.button<{ active$: boolean }>`
  ${blankButtonMixin};

  color: inherit;
  opacity: ${({ active$ }) => (active$ ? 1 : 0.5)};
  padding: 10px;
  font-size: 16px;
  font-weight: 600;
`

export const PrimaryInputBox = styled.div`
  margin: 10px 0 0 0;
  padding: 0 20px 20px 20px;
`

export const PrimaryInput = styled.input`
  width: 100%;
  border: none;
  background: var(${UI.COLOR_PAPER_DARKER});
  font-size: 18px;
  border-radius: 20px;
  padding: 16px;
  color: inherit;
  outline: none;

  ::placeholder {
    color: inherit;
  }

  &:focus {
    ::placeholder {
      color: var(${UI.COLOR_TEXT_OPACITY_70});
    }
  }
`
