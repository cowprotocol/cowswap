import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const ClaimableAmountContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  background-color: var(${UI.COLOR_BACKGROUND});

  padding: 0.75rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
  border-radius: 0.75rem;

  span {
    font-weight: 600;
  }
`

export const ContentWrapper = styled.div`
  flex-grow: 1;
  justify-content: center;
  align-items: center;
  flex-flow: column wrap;

  display: flex;
  justify-content: center;
  align-items: center;

  text-align: center;
`

export const Input = styled.input`
  border: 1px solid var(${UI.COLOR_BORDER});
  background: var(${UI.COLOR_PAPER_DARKER});
  color: inherit;
  width: 100%;
  margin: 10px 0;
  margin-top: 0;
  padding: 10px;
  border-radius: 12px;
  outline: none;
  font-size: 15px;
  font-weight: bold;

  &:focus {
    border: 1px solid var(${UI.COLOR_PRIMARY});
  }
`

export const Link = styled.button`
  border: none;
  padding: 0;
  text-decoration: underline;
  display: text;
  cursor: pointer;
  background: none;
  color: white;
  margin: 10px 0;
`

export const Row = styled.div`
  display: flex;
  flex-flow: column;
  width: 100%;

  label {
    margin: 10px;
    flex-grow: 0;
    width: 5em;
  }

  input,
  textarea {
    flex-grow: 1;
  }

  /* Chrome, Safari, Edge, Opera */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`

export const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 100%;

  padding-bottom: 1rem;

  flex-grow: 1;
`
