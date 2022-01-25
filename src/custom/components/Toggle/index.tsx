import styled from 'styled-components/macro'
import ToggleUni, { ToggleProps as TogglePropsUni, ToggleElement } from '@src/components/Toggle'

export type ToggleProps = TogglePropsUni

const WrappedToggle = styled(ToggleUni)`
  background: ${({ theme }) => theme.bg7};

  ${ToggleElement} {
    color: ${({ theme }) => theme.text1};
    border: 2px solid transparent;
    transition: border 0.2s ease-in-out;

    &:hover {
      color: ${({ theme }) => theme.text1};
      border: 2px solid ${({ theme }) => theme.text1};
    }
  }

  &.disabled {
    cursor: default;

    ${ToggleElement} {
      opacity: 0.5;

      &:hover {
        border: 2px solid transparent;
      }
    }
  }
`

export default function Toggle(props: ToggleProps) {
  return <WrappedToggle {...props} />
}
