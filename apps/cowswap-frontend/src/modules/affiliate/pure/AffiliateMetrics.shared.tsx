import { Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const MetaRow = styled.div`
  margin: 0;
  font-size: 12px;
  color: var(${UI.COLOR_TEXT_OPACITY_60});
  display: inline-flex;
  align-items: center;
  gap: 6px;

  span[title] {
    cursor: help;
  }
`

export const MetricsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 32px;
  width: 100%;
  justify-content: space-between;

  ${Media.upToExtraSmall()} {
    flex-direction: column;
    align-items: flex-start;
  }
`

export const MetricsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1 1 auto;
  width: 100%;
  max-width: 420px;
`

export const MetricItem = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  font-size: 13px;
  font-weight: 500;
  color: var(${UI.COLOR_TEXT_OPACITY_60});

  strong {
    color: var(${UI.COLOR_TEXT});
    text-align: right;
    white-space: nowrap;
    font-weight: 500;
  }
`

export const LabelContent = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0px;
`

export const BottomMetaRow = styled(MetaRow)`
  margin-top: auto;
`

export const TitleWithTooltip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
`

export { DonutValue } from './Donut'
