import styled from 'styled-components/macro'

export const SettingsBoxWrapper = styled.label`
  position: relative;
  display: flex;
  justify-content: space-between;
  margin: 0;
  gap: 10px;
  color: inherit;
  cursor: pointer;

  &::before {
    content: '';
    position: absolute;
    inset: calc(-0.5 * var(--toggleGap, var(--padding))) calc(-1 * var(--padding));

    // For debugging:
    // background: rgba(255, 0, 0, 0.25);
  }

  &:has([disabled]) {
    cursor: not-allowed;
    opacity: 0.7;
    pointer-events: none;
  }
`
