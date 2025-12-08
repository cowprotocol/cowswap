import { Box } from 'rebass/styled-components'
import styled from 'styled-components/macro'

export const Row = styled(Box)<{
  width?: string
  align?: string
  justify?: string
  padding?: string
  border?: string
  borderRadius?: string
  gap?: string | number
}>`
  align-items: ${({ align }) => align ?? 'center'};
  border-radius: ${({ borderRadius }) => borderRadius};
  border: ${({ border }) => border};
  display: flex;
  gap: ${({ gap }) => (typeof gap === 'number' ? `${gap}px` : gap) ?? 0};
  justify-content: ${({ justify }) => justify ?? 'flex-start'};
  padding: 0;
  padding: ${({ padding }) => padding};
  width: ${({ width }) => width ?? '100%'};
`

export const RowBetween = styled(Row)`
  justify-content: space-between;
`

export const AutoRow = styled(Row)<{ gap?: string; justify?: string }>`
  flex-wrap: wrap;
  gap: ${({ gap }) => gap ?? 0};
  justify-content: ${({ justify }) => justify && justify};
  margin: ${({ gap }) => gap && `-${gap}`};

  & > * {
    margin: ${({ gap }) => gap} !important;
  }
`

export const RowFixed = styled(Row)<{ gap?: number; justify?: string }>`
  align-items: center;
  gap: ${({ gap = 4 }) => gap}px;
  justify-content: flex-start;
  min-width: initial;
  width: fit-content;
`
