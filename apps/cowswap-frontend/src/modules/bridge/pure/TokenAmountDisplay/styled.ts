import styled from 'styled-components/macro'

import { StatusColor } from 'modules/bridge/utils/status'

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
`
