import styled from 'styled-components'

export interface Props {
  className?: string
}

export const FormMessage = styled.div.attrs<Props>((props) => ({
  className: props.className ? undefined : 'error',
}))`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: inherit;
  margin: 0 0 0 0.3rem;
  color: var(--color-text-primary);
  width: 100%;

  > a {
    color: var(--color-text-active);
    margin: 0 0 0 0.3rem;
  }

  > a.depositNow {
    margin: 0.5rem;
  }

  .success {
    color: green;
    text-decoration: none;
  }

  &.error,
  &.warning {
    > strong {
      color: inherit;
    }
  }

  &.error {
    color: var(--color-error);
  }
  &.warning {
    color: var(--color-text-primary);
    background: var(--color-background-validation-warning);
    border-radius: 0 0 0.3rem 0.3rem;
    padding: 0.5rem 0.7rem;
    box-sizing: border-box;
    margin: 0.3rem 0 1rem;
  }
  &.hidden {
    visibility: hidden;
  }
`
