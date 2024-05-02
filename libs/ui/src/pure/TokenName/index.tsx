import styled from 'styled-components/macro'

import { sanitizeTokenName } from './sanitizeTokenName'

export type TokenNameProps = {
  token: { name?: string } | undefined
  className?: string
  length?: number
}

const Wrapper = styled.span<{ length?: number }>`
  display: inline-block;
  width: ${({ length }) => length}px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  :hover {
    white-space: inherit;
  }
`

export function TokenName({ token, className, length = 200 }: TokenNameProps) {
  const { name } = token || {}

  if (!name) return null

  return (
    <Wrapper length={length} className={className}>
      {sanitizeTokenName(name)}
    </Wrapper>
  )
}
