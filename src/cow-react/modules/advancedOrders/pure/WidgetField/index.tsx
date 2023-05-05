import styled from 'styled-components/macro'
import { transparentize } from 'polished'

export const WidgetField = styled.div`
  background: ${({ theme }) => theme.grey1};
  border-radius: 16px;
  padding: 0.5rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-flow: row wrap;
  flex: 1;
`

export const WidgetLabel = styled.span`
  color: ${({ theme }) => transparentize(0.3, theme.text1)};
  display: flex;
  align-items: center;
  font-size: 13px;
  font-weight: 500;
`

export const WidgetContent = styled.div``
