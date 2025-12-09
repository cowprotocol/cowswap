import { Media, UI } from '@cowprotocol/ui'

import { darken, transparentize } from 'color2k'
import styled from 'styled-components/macro'

const ModalMessage = styled.div`
  display: flex;
  flex-flow: row wrap;
  padding: 16px 0 0;
  width: 100%;
  color: ${({ theme }) => transparentize(theme.text, 0.15)};
  font-size: 14px;
  line-height: 1.3;

  ${Media.upToSmall()} {
    margin-top: 2rem;
  }

  > span {
    margin: 0 0 8px;
  }
`
