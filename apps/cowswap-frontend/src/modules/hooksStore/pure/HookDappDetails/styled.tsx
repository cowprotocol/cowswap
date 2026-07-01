import { UI, Media } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { InfoTable, InfoTableWrapper } from '../HookInfoTable/HookInfoTable.styled'

export const Wrapper = styled.div`
  flex: 1;
  width: 100%;
`

export const Header = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 20px;

  > img {
    --size: 140px;
    width: var(--size);
    height: var(--size);
    object-fit: contain;
    background: var(${UI.COLOR_TEXT_OPACITY_10});
    border-radius: 16px;
    padding: 14px;
  }

  > span {
    display: flex;
    flex-flow: column wrap;
    justify-content: space-between;
    gap: 10px;
    height: 100%;

    > button {
      margin: auto 0 0;
      width: min-content;
    }

    > h3 {
      font-size: 21px;
      font-weight: bold;
      line-height: 1.2;
    }

    > p {
      margin: 0 0 16px;
      color: var(${UI.COLOR_TEXT_OPACITY_70});
    }
  }
`

export const Body = styled.div`
  margin: 24px 0;
  padding: 0 10px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  font-size: 15px;
  line-height: 1.4;

  ${Media.upToSmall()} {
    font-size: 14px;
    padding: 0 20px;
  }

  > p {
    color: inherit;
    font-size: inherit;
    line-height: inherit;
  }
`

export const Tags = styled(InfoTableWrapper)`
  ${InfoTable} td:first-child > span {
    display: inline-block;
    vertical-align: sub;
  }
`
