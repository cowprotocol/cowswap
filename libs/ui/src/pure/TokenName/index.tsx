import styled from 'styled-components/macro'

import { sanitizeTokenName } from './sanitizeTokenName'

import { Media } from '../../consts'

export type TokenNameProps = {
  token: { name?: string } | undefined
  className?: string
  length?: number
}

const Wrapper = styled.span<{ length?: number }>`
  display: inline-block;
  width: ${({ length }) => length ?? 200}px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  ${Media.upToSmall()} {
    white-space: normal;
    width: 100%;
    word-break: break-word;
    padding: 0 5px 0 0;
  }
`

export function TokenName({ token, className, length }: TokenNameProps) {
  const { name } = token || {}

  if (!name) return null

  return (
    <Wrapper length={length} className={className} title={sanitizeTokenName(name)}>
      {sanitizeTokenName(name)}
    </Wrapper>
  )
}
