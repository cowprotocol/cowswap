import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  overflow: auto;
  margin-bottom: 15px;
`
export const ListWrapper = styled.div`
  display: block;
  width: 100%;
  height: 100%;
  overflow: auto;

  ${({ theme }) => theme.colorScrollbar};
`

export const ListInner = styled.div`
  width: 100%;
  position: relative;
`

export const ListScroller = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
`

export const LpTokenWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
`

export const ListHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 100px 50px 20px;
  font-size: 12px;
  font-weight: 500;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  margin: 0 20px 15px 20px;
`

export const ListItem = styled.div`
  display: grid;
  grid-template-columns: 1fr 100px 50px 20px;
  padding: 10px 20px;
  cursor: pointer;

  &:hover {
    background: var(${UI.COLOR_PAPER_DARKER});
  }
`

export const LpTokenLogo = styled.div`
  --size: 36px;
  --halfSize: 18px;

  width: var(--size);
  height: var(--size);
  position: relative;

  > div {
    position: absolute;
    width: var(--halfSize);
    overflow: hidden;
  }

  > div:last-child {
    right: -1px;
  }

  > div:last-child > div {
    right: 100%;
    position: relative;
  }
`

export const LpTokenInfo = styled.div`
  display: flex;
  flex-direction: column;

  > p {
    margin: 0;
    font-size: 13px;
    color: var(${UI.COLOR_TEXT_OPACITY_70});
  }
`
