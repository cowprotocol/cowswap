import styled from 'styled-components/macro'

export interface WrapperProps {
  faded?: boolean
}

export const Wrapper = styled.img<WrapperProps>`
  width: 2.8rem;
  height: 2.8rem;
  border-radius: 3.6rem;
  object-fit: contain;
  background-color: white;
  opacity: ${(props): number => (props.faded ? 0.4 : 1)};
`
