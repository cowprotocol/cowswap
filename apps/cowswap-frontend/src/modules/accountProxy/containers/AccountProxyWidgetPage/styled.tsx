import { Media } from '@cowprotocol/ui'

import { transparentize } from 'color2k'
import { Link } from 'react-router'
import styled from 'styled-components/macro'
import { WIDGET_MAX_WIDTH } from 'theme'

export const EmptyWrapper = styled.div<{ $modalMode: boolean }>`
  width: 100%;
`

export const ModalWrapper = styled.div<{ $modalMode: boolean }>`
  position: ${({ $modalMode }) => ($modalMode ? 'fixed' : 'static')};
  width: 100%;
  height: 100%;
  z-index: 100;
  left: 0;
  top: 0;
  overflow-y: scroll;
  padding: 50px 0;
  background: ${({ theme }) => (theme.isWidget ? 'transparent' : transparentize(theme.black, 0.5))};
  backdrop-filter: blur(3px);

  ${Media.upToSmall()} {
    padding: 0;
  }
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
