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
  padding: 10px;
  margin: 0 auto;
  gap: 8px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  flex: 1;
`

 