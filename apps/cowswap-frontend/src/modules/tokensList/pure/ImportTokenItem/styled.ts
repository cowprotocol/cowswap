import styled from 'styled-components/macro'

import { UI } from 'common/constants/theme'

import { blankButtonMixin } from '../commonElements'

export const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 0 20px;
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`
export const ImportButton = styled.button`
  ${blankButtonMixin};

  background-color: var(${UI.COLOR_CONTAINER_BG_02});
  color: var(${UI.COLOR_WHITE});
  font-size: 16px;
  font-weight: 600;
  padding: 6px 15px;
  border-radius: 24px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: var(${UI.COLOR_LINK});
  }
`
