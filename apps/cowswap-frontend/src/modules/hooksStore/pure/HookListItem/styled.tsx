import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const HookDappListItem = styled.li`
  flex: 1 1 100px;
  margin: 8px;
  box-sizing: border-box;
  text-align: center;
  background-color: var(${UI.COLOR_PAPER});

  display: flex;
  flex-direction: row;
  justify-content: space-between;

  position: relative;
`

export const HookDappDetails = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0.5em;

  flex-grow: 1;

  h3 {
  }

  p {
    text-align: left;
    padding: 0;
    margin: 0;
    flex-grow: 1;
    color: var(${UI.COLOR_TEXT2});
  }

  a {
    display: block;
    margin: 20px 0 0px 0;
    font-size: 0.8em;
    text-decoration: underline;
    font-weight: 600;
  }
`

export const Link = styled.button`
  display: inline-block;
  cursor: pointer;
  margin: 0;
  background: none;
  border: none;
  outline: none;
  color: inherit;

  font-weight: 600;
  font-size: 12px;
  text-decoration: underline;

  &:hover {
    text-decoration: none;
  }
`

export const Version = styled.div`
  position: absolute;
  top: 0;
  right: 0;

  padding: 5px;
  font-size: 0.8em;
  color: var(${UI.COLOR_TEXT2});
  font-weight: 600;
`
