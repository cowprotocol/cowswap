import styled from 'styled-components/macro'

import { UI } from 'common/constants/theme'

import { blankButtonMixin } from '../../pure/commonElements'

export const Wrapper = styled.div`
  display: block;
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
