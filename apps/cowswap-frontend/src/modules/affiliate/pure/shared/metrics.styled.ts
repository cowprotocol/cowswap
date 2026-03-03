import { Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const MetricsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 32px;
  width: 100%;
`

export const MetricsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

export const MetaRow = styled.div`
  width: 100%;
  margin: 0;
  font-size: 12px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;

  > span {
    font-weight: inherit;
  }

  > span > span[title] {
    cursor: help;
  }
`

export const StatusText = styled.p<{ $variant: 'error' | 'success' }>`
  margin: 0 0 0 8px;
  font-size: 14px;
  color: ${({ $variant }) => ($variant === 'error' ? `var(${UI.COLOR_DANGER_TEXT})` : `var(${UI.COLOR_SUCCESS_TEXT})`)};
`

export const PayoutValue = styled.div`
  font-size: 26px;
  font-weight: 600;
  color: var(${UI.COLOR_TEXT});
  display: flex;
  align-items: center;
  gap: 12px;
`

export const BottomMetaRow = styled(MetaRow)`
  margin-top: auto;
`

export const TitleWithTooltip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
`

export const RewardsMetricsRow = styled(MetricsRow)`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  column-gap: 24px;
  row-gap: 16px;
  align-items: center;
  margin: auto;
  width: 100%;

  ${Media.upToExtraSmall()} {
    grid-template-columns: 1fr;
    row-gap: 20px;
    align-items: flex-start;
  }
`

export const RewardsMetricsList = styled(MetricsList)`
  min-width: 0;
  width: 100%;
  max-width: none;
`

export const MetricValue = styled.strong`
  color: var(${UI.COLOR_TEXT});
  text-align: right;
  white-space: nowrap;
  font-weight: 500;
`

export const MetricItem = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) max-content;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

export const LabelContent = styled.span`
  display: inline-flex;
  align-items: center;
  font-weight: 600;
`
