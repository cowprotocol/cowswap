import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const EditWrapper = styled.div`
  display: flex;
  flex-direction: column;
  background: var(${UI.COLOR_PAPER_DARKER});
  padding: 14px;
  margin: 15px;
  border-radius: 14px;
  border: 2px solid var(${UI.COLOR_PAPER_DARKEST});
`

export const InputHeader = styled.div`
  display: flex;
  font-size: 13px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

export const ResetBtn = styled.button`
  font-size: 12px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  background: var(${UI.COLOR_PAPER});
  line-height: 100%;
  margin-left: 5px;
`
