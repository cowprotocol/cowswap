import styled from 'styled-components/macro'
import { WIDGET_MAX_WIDTH } from 'theme'

export const Wrapper = styled.div`
  width: 100%;
  max-width: ${WIDGET_MAX_WIDTH.swap};
  margin: 0 auto;
  position: relative;
`

export const HookDappsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 10px 0 0 0;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-wrap: wrap;
  align-items: stretch;
  flex: 1;

  img {
    width: 120px;
    max-height: 120px;
    height: 100%;
    cursor: pointer;
  }
`
