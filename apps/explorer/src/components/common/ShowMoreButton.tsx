import { Color } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const ShowMoreButton = styled.button`
  font-size: 1.4rem;
  margin-top: 0.5rem;
  border: none;
  background: none;
  color: ${Color.explorer_textActive};
  align-self: flex-start;
  padding: 0;

  :hover {
    text-decoration: underline;
    cursor: pointer;
  }
`
