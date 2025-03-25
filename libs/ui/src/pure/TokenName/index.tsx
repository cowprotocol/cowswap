import styled from 'styled-components/macro'

import { sanitizeTokenName } from './sanitizeTokenName'

import { Media } from '../../consts'
import { UI } from '../../enum'

export type TokenNameProps = {
  token: { name?: string } | undefined
  className?: string
}

const Wrapper = styled.span<{ length?: number }>`
  display: inline-flex;
  align-items: center;
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  font-weight: 400;
  color: var(${UI.COLOR_TEXT_OPACITY_70});

  ${Media.upToSmall()} {
    word-break: break-word;
    padding: 0 5px 0 0;
  }
`

export function TokenName({ token, className }: TokenNameProps) {
  const { name } = token || {}

  if (!name) return null

  return (
    <Wrapper className={className} title={sanitizeTokenName(name)}>
      {sanitizeTokenName(name)}
    </Wrapper>
  )
}
