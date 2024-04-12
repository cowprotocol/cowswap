import { UI } from '@cowprotocol/ui'
import styled from 'styled-components/macro'

const SingleLetterLogoWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(${UI.COLOR_INFO_BG});
`

type SingleLetterLogoProps = {
  initial: string
}

export function SingleLetterLogo({ initial }: SingleLetterLogoProps) {
  return <SingleLetterLogoWrapper>{initial}</SingleLetterLogoWrapper>
}
