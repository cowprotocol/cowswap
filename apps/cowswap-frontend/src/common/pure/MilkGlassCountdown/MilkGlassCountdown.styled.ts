import { Media } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  align-content: center;
  justify-content: center;
  gap: 16px 28px;
  width: 100%;
  height: 100%;
`

export const TimerColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  width: 204px;

  /* Below this the row no longer fits and the glass wraps under the timer, so center to match. */
  ${Media.upToExtraSmall()} {
    align-items: center;
    text-align: center;
  }
`

export const TimerLabel = styled.span`
  font-size: 13px;
  line-height: 18px;
  width: 100%;
`

export const GlassBox = styled.div`
  display: flex;
  justify-content: center;
  flex: 0 0 150px;
`
