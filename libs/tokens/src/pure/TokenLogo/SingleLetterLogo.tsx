import { UI } from '@cowprotocol/ui'
import styled from 'styled-components/macro'

const SingleLetterLogoWrapper = styled.div<{ size: number }>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(${UI.COLOR_INFO_BG});
`

type SingleLetterLogoProps = {
  initial: string
  size: number
}

export function SingleLetterLogo({ initial, size }: SingleLetterLogoProps) {
  return <SingleLetterLogoWrapper size={size}>{initial}</SingleLetterLogoWrapper>
}
