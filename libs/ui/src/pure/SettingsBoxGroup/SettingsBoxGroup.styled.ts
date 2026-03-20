import styled from 'styled-components/macro'

export const SettingsBoxGroupWrapper = styled.div`
  /*
    touch devices: visually larger, so less separation
    mouse: visually smaller, so more separation

    We use this component to make vertical rhythm consistent between touch and
    mouse devices.
  */

  --toggleGap: 8px;

  @media (pointer: fine) {
    --toggleGap: 12px;
  }

  display: flex;
  flex-direction: column;
  gap: var(--toggleGap);
`
