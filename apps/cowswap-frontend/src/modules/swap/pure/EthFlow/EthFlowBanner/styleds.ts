import { ButtonPrimary } from '@cowprotocol/ui'

import { transparentize } from 'polished'
import styled from 'styled-components/macro'

import { UI } from 'common/constants/theme'

export const BannerWrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  background-color: ${({ theme }) => transparentize(0.8, theme.text3)};
  border-radius: 16px;
  padding: 14px;
  margin: 10px 0 0;
  font-size: 13px;
  cursor: pointer;
  min-height: 58px;
`

export const ClosedBannerWrapper = styled.div`
  display: grid;
  grid-gap: 10px;
  grid-template-columns: repeat(3, auto);
  align-items: center;
  font-weight: 500;
  margin: auto;
  width: 100%;

  > b {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  > svg {
    margin: auto;
    cursor: pointer;

    > path {
      fill: var(${UI.COLOR_TEXT1});
    }
  }

  > svg:last-child {
    stroke: ${({ theme }) => transparentize(0.3, theme.text1)};
  }

  &:hover > svg:last-child {
    stroke: var(${UI.COLOR_TEXT1});
  }
`

export const BannerInnerWrapper = styled.div`
  display: grid;
  grid-template-rows: auto;
  align-items: center;
  justify-content: stretch;
  width: 100%;
  text-align: left;

  > p {
    padding: 0 10px;
    margin-bottom: 0;
  }

  > p,
  ul {
    color: ${({ theme }) => transparentize(0.15, theme.text1)};
    line-height: 1.5;
  }

  ${ButtonPrimary} {
    font-size: 14px;
    min-height: 46px;
    padding: 0;
    margin: 10px auto 0;
  }
`
