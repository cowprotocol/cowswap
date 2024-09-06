import { UI } from '@cowprotocol/ui'

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

export const DappInfoHeader = styled.div`
  display: flex;
  padding: 10px 0 20px 0;
  margin-top: 10px;
  border-bottom: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
  align-items: center;

  p {
    padding: 0 1em;
  }

  > img {
    width: 60px;
  }
`
