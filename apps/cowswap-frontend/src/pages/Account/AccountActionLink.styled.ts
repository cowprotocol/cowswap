import { Media } from '@cowprotocol/ui'

import { css } from 'styled-components/macro'

export const accountActionLinkMixin = css`
  font-size: 13px;
  height: 100%;
  font-weight: 500;
  border-radius: 0;
  min-height: initial;
  margin: 0;
  padding: 0;
  line-height: 1;
  color: inherit;
  display: flex;
  align-items: center;
  text-decoration: underline;

  ${Media.upToMedium()} {
    font-size: 15px;
    margin: 0 auto;
  }
`
