import styled from 'styled-components/macro'
import { WIDGET_MAX_WIDTH } from 'theme'

export const Container = styled.div`
  width: 100%;
  max-width: ${WIDGET_MAX_WIDTH.swap};
  margin: 0 auto;
  position: relative;
`
