import styled from 'styled-components/macro'

const MODAL_MAX_WIDTH = 450

export const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 100%;
  max-width: ${MODAL_MAX_WIDTH}px;
`

export const HookDappsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-wrap: wrap
  align-items: stretch;

  img {
    width: 120px;
    max-height: 120px;
    height: 100%;
    cursor: pointer;
  }

`
