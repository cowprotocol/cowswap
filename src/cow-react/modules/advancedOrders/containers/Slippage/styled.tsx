import styled from 'styled-components/macro'
import { RowBetween } from 'components/Row'

export const PercentSign = styled.span`
  margin-left: 5px;
  font-size: 22px;
`

export const ErrorRow = styled(RowBetween)<{ error: boolean }>`
  color: ${({ theme, error }) => (error ? theme.danger : theme.warning)};
  font-size: 12px;
  padding-top: 5px;
`
