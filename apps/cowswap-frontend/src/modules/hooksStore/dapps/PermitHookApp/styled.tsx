import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 100%;
  padding: 10px;

  flex-grow: 1;
`

export const ContentWrapper = styled.div`
  flex-grow: 1;
  justify-content: center;
  align-items: center;
  flex-flow: column wrap;
  display: flex;
  padding: 1em;
  text-align: center;
`

export const Row = styled.div`
  display: grid;
  grid-template-columns: 6rem 1fr;
  width: 100%;
  margin-bottom: 16px;
  align-items: center;

  label {
    text-align: right;
    padding-right: 10px;
    font-size: 14px;
  }

  input,
  textarea {
    width: 100%;
    resize: vertical;
    border: 1px solid var(${UI.COLOR_TEXT_OPACITY_25});
    padding: 5px;
    border-radius: 4px;

    &:focus {
      outline: none;
      border: 1px solid var(${UI.COLOR_TEXT_OPACITY_50});
    }
  }
`
