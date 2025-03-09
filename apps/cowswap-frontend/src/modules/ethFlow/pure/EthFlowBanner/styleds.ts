import { ButtonPrimary, UI } from '@cowprotocol/ui'

import { transparentize } from 'color2k'
import styled from 'styled-components/macro'

export const BannerWrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  background-color: var(${UI.COLOR_PAPER_DARKER});
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
  grid-template-rows: max-content;
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
    transition: opacity ${UI.ANIMATION_DURATION} ease-in-out;

    > path {
      fill: currentColor;
    }
  }

  > svg:last-child {
    stroke: currentColor;
    opacity: 0.7;
  }

  &:hover > svg:last-child {
    stroke: currentColor;
    opacity: 1;
  }
`

export const BannerInnerWrapper = styled.div`
  display: grid;
  grid-template-rows: max-content;
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
    color: ${({ theme }) => transparentize(theme.text, 0.15)};
    line-height: 1.5;
  }

  ${ButtonPrimary} {
    font-size: 14px;
    min-height: 46px;
    padding: 0;
    margin: 10px auto 0;
  }
`
