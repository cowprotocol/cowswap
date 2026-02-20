import styled from 'styled-components/macro'
import { WIDGET_MAX_WIDTH } from 'theme'

export const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  gap: 10px;
  width: 100%;
  max-width: ${WIDGET_MAX_WIDTH.swap};
  margin: 0 auto;
`
