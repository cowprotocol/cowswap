import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { RateInfo } from 'common/pure/RateInfo'

export const Box = styled.div<{ noMargin: boolean }>`
  display: flex;
  flex-flow: column wrap;
  width: 100%;
  margin: ${({ noMargin }) => (noMargin ? '0' : '6px 8px')};
`

export const Row = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 400;
  color: inherit;
  min-height: 24px;
  gap: 3px;

  > div {
    display: flex;
    align-items: center;

    &:first-child {
      font-weight: 400;
      gap: 3px;
    }

    &:first-child > span {
      color: var(${UI.COLOR_TEXT_OPACITY_25});
      transition: color var(${UI.ANIMATION_DURATION}) ease-in-out;

      &:hover {
        color: inherit;
      }
    }

    &:last-child {
      text-align: right;
    }
  }
`

export const StyledRateInfo = styled(RateInfo)`
  font-size: 13px;
  font-weight: 500;
  min-height: 24px;
`
