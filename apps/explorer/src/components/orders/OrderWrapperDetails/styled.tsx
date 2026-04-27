import { Color } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const WrapperList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-flow: column wrap;
  gap: 1rem;
`

export const WrapperItem = styled.li`
  display: flex;
  flex-flow: column wrap;
  gap: 0.5rem;
`

export const WrapperHeader = styled.p`
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;

  > img {
    width: 2rem;
    height: 2rem;
  }
`

export const RenderedData = styled.div`
  border: 0.1rem solid ${Color.explorer_tableRowBorder};
  border-radius: 0.5rem;
  background: ${Color.explorer_tableRowBorder};
  padding: 1.4rem;
  overflow: auto;
  word-break: break-all;
  line-height: 1.5;

  table {
    border-collapse: collapse;
    width: 100%;
  }

  td {
    padding: 0.2rem 1rem 0.2rem 0;
    vertical-align: top;

    &:first-child {
      font-weight: 500;
      white-space: nowrap;
    }
  }

  code {
    font-size: 1.2rem;
  }
`
