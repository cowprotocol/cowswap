import styled from 'styled-components/macro'
import ToggleUni, { ToggleProps as TogglePropsUni, ToggleElement } from '@src/components/Toggle'

export type ToggleProps = TogglePropsUni

const Wrapper = styled(ToggleUni)`
  background: ${({ theme }) => theme.bg4};

  ${ToggleElement} {
    color: ${({ theme }) => theme.text1};
    border: 2px solid transparent;
    transition: border 0.2s ease-in-out;

    &:hover {
      color: ${({ theme }) => theme.text1};
      border: 2px solid ${({ theme }) => theme.text1};
    }
  }
  .disabled {
    background: ${({ theme }) => theme.primary1};
    color: ${({ theme }) => theme.text2};
  }
`

export default function Toggle(props: ToggleProps) {
  return <Wrapper {...props} />
}
