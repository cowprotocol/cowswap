import { UI, Media } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  flex: 1;
  width: 100%;
`

export const Header = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 20px;

  > img {
    --size: 140px;
    width: var(--size);
    height: var(--size);
    object-fit: contain;
    background: var(${UI.COLOR_TEXT_OPACITY_10});
    border-radius: 16px;
    padding: 14px;
  }

  > span {
    display: flex;
    flex-flow: column wrap;
    justify-content: space-between;
    gap: 10px;
    height: 100%;

    > button {
      margin: auto 0 0;
      width: min-content;
    }

    > h3 {
      font-size: 21px;
      font-weight: bold;
      line-height: 1.2;
    }

    > p {
      margin: 0 0 16px;
      color: var(${UI.COLOR_TEXT_OPACITY_70});
    }
  }
`

export const Body = styled.div`
  margin: 24px 0;
  padding: 0 10px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  font-size: 15px;
  line-height: 1.4;

  ${Media.upToSmall()} {
    font-size: 14px;
    padding: 0 20px;
  }

  > p {
    color: inherit;
    font-size: inherit;
    line-height: inherit;
  }
`

export const Tags = styled.div`
  margin: 32px auto 16px;
  font-size: 14px;
  padding: 0 10px;

  ${Media.upToSmall()} {
    padding: 0 20px;
    overflow-x: auto;
  }

  h3 {
    margin: 0;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  tbody {
  }

  tr {
    border-bottom: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
  }

  tr:last-child {
    border-bottom: none;
  }

  td {
    padding: 10px 0;
  }

  td:first-child {
    color: var(${UI.COLOR_TEXT_OPACITY_50});
    white-space: nowrap;
    padding: 0 10px 0 0;

    > span {
      display: inline-block;
      vertical-align: sub;
    }

    a {
      color: inherit;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
`
