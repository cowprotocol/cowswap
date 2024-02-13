import { LoadingRows as BaseLoadingRows } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const TokensInner = styled.div`
  width: 100%;
  position: relative;
`

export const TokensScroller = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
`

export const LoadingRows = styled(BaseLoadingRows)`
  grid-column-gap: 0.5em;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: max-content;
  max-width: 960px;
  padding: 12px 20px;

  & > div:nth-child(4n + 1) {
    grid-column: 1 / 8;
    height: 1em;
    margin-bottom: 0.25em;
  }
  & > div:nth-child(4n + 2) {
    grid-column: 12;
    height: 1em;
    margin-top: 0.25em;
  }
  & > div:nth-child(4n + 3) {
    grid-column: 1 / 4;
    height: 0.75em;
  }
`
