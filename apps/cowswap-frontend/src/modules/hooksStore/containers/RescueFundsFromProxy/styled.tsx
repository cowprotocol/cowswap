import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'
import { WIDGET_MAX_WIDTH } from 'theme'

export const Wrapper = styled.div`
  width: 100%;
  max-width: ${WIDGET_MAX_WIDTH.swap};
  margin: 0 auto;
  position: relative;
`

export const ProxyInfo = styled.div`
  display: flex;
  flex-flow: column wrap;
  gap: 10px;
  margin: 20px 0;
  text-align: center;

  > h4 {
    font-size: 14px;
    font-weight: 600;
    margin: 10px auto 0;
  }

  > a {
    color: inherit;
    width: 100%;
  }

  > a > span {
    font-size: 100%;
    background: var(${UI.COLOR_PAPER_DARKER});
    border-radius: 16px;
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    margin: 0 auto;
    word-break: break-all;
  }
`

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;

  p {
    text-align: center;
  }
`
