import { Color } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Item = styled.li`
  margin: 0;
`

export const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  gap: 0.5rem;
  align-items: flex-start;

  > p {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  > p > i {
    font-weight: bold;
    font-style: normal;
  }

  > p > img {
    width: 2rem;
    height: 2rem;
  }
`

export const ToggleButton = styled.button`
  background: none;
  border: none;
  color: ${Color.explorer_textActive};
  cursor: pointer;
  font-size: 1.4rem;
  padding: 0.5rem 0;
  text-align: left;

  &:hover {
    text-decoration: underline;
  }
`

export const Details = styled.div`
  margin: 0 0 1rem;
  word-break: break-all;
  line-height: 1.5;
  overflow: auto;
  border: 0.1rem solid ${Color.explorer_tableRowBorder};
  padding: 1.4rem;
  background: ${Color.explorer_tableRowBorder};
  border-radius: 0.5rem;
  white-space: pre-wrap;

  > p {
    margin: 0;
  }

  > p > i {
    font-weight: 500;
    font-style: normal;
  }
`
