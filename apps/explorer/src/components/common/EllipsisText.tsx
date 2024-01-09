import styled from 'styled-components'

export interface Props {
  $maxWidth?: string
}

export const EllipsisText = styled.div<Props>`
  font-size: inherit;
  max-width: ${({ $maxWidth = '6ch' }): string => $maxWidth};
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`
