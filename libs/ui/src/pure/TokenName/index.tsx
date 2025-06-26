import { formatSymbol } from '@cowprotocol/common-utils'

import styled from 'styled-components/macro'

import { sanitizeTokenName } from './sanitizeTokenName'

import { Media } from '../../consts'
import { UI } from '../../enum'

export type TokenNameProps = {
  token: { name?: string } | undefined
  className?: string
  maxLength?: number
}

const Wrapper = styled.span`
  display: inline-block;
  align-items: center;
  font-size: 13px;
  font-weight: 400;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  position: relative;
  line-height: 1.4;
  word-break: break-word;

  ${Media.upToSmall()} {
    padding: 0 5px 0 0;
  }
`

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function TokenName({ token, className, maxLength = 200 }: TokenNameProps) {
  const { name } = token || {}

  if (!name) return null

  const sanitizedName = sanitizeTokenName(name)
  const formattedName = formatSymbol(sanitizedName, maxLength)

  return (
    <Wrapper className={className} title={sanitizedName}>
      {formattedName}
    </Wrapper>
  )
}
