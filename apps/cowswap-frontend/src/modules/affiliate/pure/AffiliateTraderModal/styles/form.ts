import { Badge, ButtonOutlined, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const TagGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  ${Badge} {
    font-size: 11px;
    padding: 4px 10px;
    border-radius: 14px;
  }
`

export const LabelAffordances = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

export const FormActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

export const FormActionButton = styled(ButtonOutlined)`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(${UI.FONT_SIZE_SMALL});
  padding: 4px 12px;
  font-weight: 600;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:hover:enabled {
    opacity: 0.8;
  }
`

export const FormActionDanger = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(${UI.FONT_SIZE_SMALL});
  font-weight: 600;
  color: var(${UI.COLOR_DANGER_TEXT});
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:hover:enabled {
    opacity: 0.8;
  }
`
