// RangeBadge.fixture.jsx
import { Box } from 'rebass'
import { ReactNode } from 'react'
import styled from 'styled-components/macro'

type WrapperParams = { background?: string; children: ReactNode }

const WrapperElem = styled.div<{ background?: string }>`
  background-color: ${({ background }) => background || 'none'};
  padding: 2rem;
  width: 200px;
`

const Wrapper = ({ background, children }: WrapperParams) => (
  <WrapperElem background={background}>
    <Box>{children}</Box>
  </WrapperElem>
)

const ButtonDecorator = ({ children }: { children: ReactNode }) => <Wrapper>{children}</Wrapper>

export default ButtonDecorator
