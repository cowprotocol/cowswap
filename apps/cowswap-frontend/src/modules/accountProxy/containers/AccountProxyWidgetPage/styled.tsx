import { Link } from 'react-router'
import styled from 'styled-components/macro'
import { WIDGET_MAX_WIDTH } from 'theme'

export const EmptyWrapper = styled.div`
  width: 100%;
`

export const WidgetWrapper = styled.div`
  width: 100%;
  max-width: ${WIDGET_MAX_WIDTH.swap};
  position: relative;
`

export const TitleWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
`

export const HelpLink = styled(Link)`
  font-weight: 400;
  font-size: 14px;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`
