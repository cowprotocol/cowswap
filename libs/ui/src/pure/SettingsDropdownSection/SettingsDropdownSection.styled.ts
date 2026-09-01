import styled from 'styled-components/macro'

import { UI } from '../../enum'

export const Section = styled.section`
  --padding: 16px;

  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: var(--padding);

  & + & {
    padding-top: calc(var(--padding) * 1.5);
    border-top: 1px solid var(${UI.COLOR_BORDER});
  }
`

export const Title = styled.h4`
  font-weight: 600;
  font-size: 15px;
  color: inherit;
  margin: 0;
`
