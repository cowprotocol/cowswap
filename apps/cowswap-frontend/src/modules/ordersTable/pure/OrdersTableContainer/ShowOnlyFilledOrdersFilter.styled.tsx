import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  background: var(${UI.COLOR_PAPER});
  border-radius: 12px;
  border: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
`

export const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(${UI.COLOR_PRIMARY});
`

export const Label = styled.label`
  font-size: 14px;
  color: var(${UI.COLOR_TEXT});
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 8px;
`