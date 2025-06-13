// RangeBadge.fixture.jsx
import { ReactNode } from 'react'

import { Box } from 'rebass'
import styled from 'styled-components/macro'

type WrapperParams = { background?: string; children: ReactNode }

const WrapperElem = styled.div<{ background?: string }>`
  background-color: ${({ background }) => background || 'none'};
  padding: 2rem;
  width: 200px;
`

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const Wrapper = ({ background, children }: WrapperParams) => (
  <WrapperElem background={background}>
    <Box>{children}</Box>
  </WrapperElem>
)

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const ButtonDecorator = ({ children }: { children: ReactNode }) => <Wrapper>{children}</Wrapper>

export default ButtonDecorator
