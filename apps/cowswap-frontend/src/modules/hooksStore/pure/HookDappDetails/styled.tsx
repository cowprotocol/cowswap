import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  flex: 1;
  width: 100%;
  padding: 10px;
  margin-top: 10px;
`

export const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;

  > img {
    width: 80px;
    background: var(${UI.COLOR_TEXT_OPACITY_10});
    border-radius: 16px;
  }

  > h3 {
    font-size: 24px;
    font-weight: 400;
  }
`

export const Body = styled.div`
  margin: 20px 0;
  padding-bottom: 20px;
  border-bottom: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});

  > p {
    color: var(${UI.COLOR_TEXT_OPACITY_70});
  }
`

export const Tags = styled.div`
  a {
    color: var(${UI.COLOR_LINK});
  }

  > div {
    display: inline-flex;
    flex-direction: column;
    font-size: 12px;
    color: var(${UI.COLOR_TEXT_OPACITY_70});
  }
`
