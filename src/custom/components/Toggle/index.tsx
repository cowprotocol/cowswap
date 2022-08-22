import styled from 'styled-components/macro'
import ToggleUni, { ToggleProps as TogglePropsUni, ToggleElement } from '@src/components/Toggle'
import { transparentize } from 'polished'

export type ToggleProps = TogglePropsUni & {
  togglesOnly?: boolean
}

const WrappedToggle = styled(ToggleUni)<Pick<ToggleProps, 'togglesOnly'>>`
  background: ${({ theme }) => theme.bg6};
  border: 1px solid ${({ theme }) => transparentize(0.8, theme.bg2)};
  border-radius: 30px;

  ${ToggleElement} {
    color: ${({ theme }) => theme.text1};
    border: 2px solid transparent;
    border-radius: 30px;
    transition: border 0.2s ease-in-out;
    background: ${({ theme }) => theme.primary1};

    ${({ togglesOnly }) => togglesOnly && `padding: 10px;`}

    &:hover {
      color: ${({ theme }) => theme.text1};
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
  const { togglesOnly, checked, unchecked } = props
  return <WrappedToggle {...props} checked={togglesOnly ? null : checked} unchecked={togglesOnly ? null : unchecked} />
}
