import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'


export const Wrapper = styled.div`
  flex: 1;
  width: 100%;
  padding: 10px;
  margin-top: 10px;
`

export const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;

  > img {
    --size: 140px;
    width: var(--size);
    height: var(--size);
    object-fit: contain;
    background: var(${UI.COLOR_TEXT_OPACITY_10});
    border-radius: 16px;
  }

  > span {
    display: flex;
    flex-flow: column wrap;
    justify-content: space-between;
    gap: 4px;
    height: 100%;

    > button {
    margin: auto 0 0;
    width: min-content;
  }

  > h3 {
      font-size: 21px;
      font-weight: bold;
    }

  > p {
    margin: 0 0 16px;
    color: var(${UI.COLOR_TEXT_OPACITY_70});
  }
}  
`


 

export const Body = styled.div`
  margin: 24px 0;
  padding: 0;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  font-size: 15px;
  line-height: 1.4;

  > p {
    color: inherit;
    font-size: inherit;
    line-height: inherit;
  }
 
`

export const Tags = styled.div`
  margin: 32px auto 0;
  font-size: 14px;

  h3 {
    margin: 0;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  tr {
    border-bottom: 1px solid var(${UI.COLOR_BORDER});
  }

  tr:last-child {
    border-bottom: none;
  }

  td {
    padding: 10px 0;
  }

  td:first-child {
    width: 30%;
    color: var(${UI.COLOR_TEXT_OPACITY_50});

  a {
    color: inherit;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`
