import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const AllowanceWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px;
  border-radius: 12px;
  background: var(${UI.COLOR_BACKGROUND});
  color: var(${UI.COLOR_TEXT_PAPER});
  font-size: 13px;
`

export const AllowanceLabel = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  letter-spacing: 0.03em;
`

export const AllowanceAmount = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: var(${UI.COLOR_TEXT});
  display: flex;
  align-items: center;
  gap: 4px;
`
