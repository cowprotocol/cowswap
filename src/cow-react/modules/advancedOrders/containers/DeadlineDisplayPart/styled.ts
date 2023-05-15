import styled from 'styled-components/macro'
import { WidgetField, WidgetLabel } from '../../pure/WidgetField'

export const Wrapper = styled(WidgetField)`
  background-color: ${({ theme }) => theme.bg0};
  border: 1px solid ${({ theme }) => theme.grey1};
  flex-shrink: 1;
`

export const Label = styled(WidgetLabel)`
  font-size: 12px;
`

export const Value = styled(WidgetLabel)`
  font-size: 12px;
`
