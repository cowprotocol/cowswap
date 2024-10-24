import { UI } from '@cowprotocol/ui'

import { ArrowRight } from 'react-feather'
import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  overflow: auto;
  margin-bottom: 15px;
`

export const LpTokenWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
`

export const ListHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 100px 50px 30px;
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

export const NoPoolWrapper = styled.div`
  border-top: 1px solid var(${UI.COLOR_BORDER});
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  padding: 20px 0 10px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  font-size: 13px;
`

export const ArrowUpRight = styled(ArrowRight)`
  transform: rotate(-45deg);
  margin-left: 2px;
  margin-bottom: -2px;
`

export const CreatePoolLink = styled.a`
  display: inline-block;
  background: #bcec79;
  color: #194d05;
  font-size: 16px;
  font-weight: bold;
  border-radius: 24px;
  padding: 10px 24px;
  text-decoration: none;

  &:hover {
    opacity: 0.8;
  }
`
