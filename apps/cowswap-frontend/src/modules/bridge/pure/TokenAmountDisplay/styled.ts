import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export enum StatusColor {
  SUCCESS = `var(${UI.COLOR_SUCCESS})`,
  PENDING = `var(${UI.COLOR_TEXT})`,
  DANGER = `var(${UI.COLOR_DANGER})`,
  ALERT = `var(${UI.COLOR_ALERT})`,
}

export const AmountWithTokenIcon = styled.div<{ colorVariant?: StatusColor }>`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: flex-end;
  text-align: right;
  word-break: break-word;
  line-height: 1;
  gap: 4px;
  color: ${({ colorVariant }) => colorVariant || 'inherit'};

  > i {
    font-style: normal;
  }
`
