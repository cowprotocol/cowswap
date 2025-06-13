import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const SingleLetterLogoWrapper = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  line-height: 1;
  color: var(${UI.COLOR_TEXT});
  background: var(${UI.COLOR_PAPER_DARKER});
  font-size: 65%;
`

type SingleLetterLogoProps = {
  initial: string
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function SingleLetterLogo({ initial }: SingleLetterLogoProps) {
  return <SingleLetterLogoWrapper>{initial}</SingleLetterLogoWrapper>
}
