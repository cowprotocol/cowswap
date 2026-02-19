import type { ReactNode } from 'react'

import { Color } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { BatchInsights, LayoutMode } from './types'

const LABEL_COLOR = 'rgba(229, 235, 255, 0.8)'
const SUBLINE_COLOR = 'rgba(229, 235, 255, 0.62)'

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: stretch;
  gap: 0.5rem;
  padding: 2rem 2rem 1rem;
  margin: 0 0 1rem;
  border-radius: 9px;
  border: 0;
  background: transparent;

  @media (max-width: 1120px) {
    grid-template-columns: 1fr;
    gap: 0.62rem;
    padding: 1rem;
  }
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  align-items: stretch;
  column-gap: 1.4rem;

  > [data-kind='orders'] {
    grid-column: 1 / span 3;
  }

  > [data-kind='surplus'] {
    grid-column: 4 / span 4;
  }

  > [data-kind='cow'] {
    grid-column: 8 / span 5;
  }

  @media (max-width: 1120px) {
    > [data-kind='orders'],
    > [data-kind='cow'],
    > [data-kind='surplus'] {
      grid-column: span 4;
    }
  }

  @media (max-width: 820px) {
    > [data-kind='cow'] {
      grid-column: 1 / span 12;
    }

    > [data-kind='orders'] {
      grid-column: 1 / span 6;
    }

    > [data-kind='surplus'] {
      grid-column: 7 / span 6;
    }
  }

  @media (max-width: 620px) {
    > [data-kind='orders'],
    > [data-kind='cow'],
    > [data-kind='surplus'] {
      grid-column: 1 / span 12;
    }
  }
`

const StatGroup = styled.section`
  min-width: 0;
  padding: 0.2rem 0.95rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 0.12rem;

  @media (max-width: 820px) {
    padding: 0.26rem 0.52rem;
  }
`

const HeroValue = styled.div`
  color: ${Color.neutral100};
  font-size: clamp(1.9rem, 2vw, 2.18rem);
  line-height: 1.04;
  font-weight: 700;
  letter-spacing: -0.018em;
  font-variant-numeric: tabular-nums lining-nums;
`

const HeroCowValue = styled(HeroValue)`
  color: ${Color.neutral100};
`

const HeroSurplusValue = styled(HeroValue)`
  color: ${Color.explorer_green1};
`

const HeroLine = styled.div`
  display: inline-flex;
  align-items: baseline;
  gap: 0.2rem;
  margin: 0 0 0.3rem;
`

const StatLabel = styled.div`
  color: ${LABEL_COLOR};
  font-size: 1.2rem;
  line-height: 1.2;
  font-weight: 500;
  letter-spacing: 0.012em;
`

const HeuristicHint = styled.span`
  color: ${LABEL_COLOR};
  font-size: 1.2rem;
  cursor: help;
`

const ControlsColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  gap: 0.24rem;

  @media (max-width: 1120px) {
    align-items: flex-end;
  }

  @media (max-width: 620px) {
    align-items: stretch;
  }
`

const ControlsPanel = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0;

  @media (max-width: 620px) {
    justify-content: flex-end;
  }
`

const SegmentedGroup = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.08rem;
  padding: 0.1rem;
  border-radius: 10px;
  border: 1px solid ${Color.explorer_border};
  background: ${Color.explorer_bg};
`

const SegmentedButton = styled.button<{ $active: boolean }>`
  appearance: none;
  border: 1px solid transparent;
  background: ${({ $active }): string => ($active ? Color.explorer_orange1 : 'transparent')};
  color: ${({ $active }): string => ($active ? Color.neutral100 : LABEL_COLOR)};
  border-radius: 8px;
  height: 1.62rem;
  padding: 0 0.62rem;
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;

  &:hover:not(:disabled) {
    background: ${({ $active }): string => ($active ? Color.explorer_orange1 : Color.explorer_bgButtonHover)};
    color: ${Color.neutral100};
  }

  &:focus-visible {
    outline: 2px solid ${Color.explorer_yellow4};
    outline-offset: 1px;
  }
`

const UsdToggleButton = styled.button<{ $active: boolean }>`
  appearance: none;
  border: 1px solid ${({ $active }): string => ($active ? Color.explorer_yellow4 : Color.explorer_border)};
  background: ${({ $active }): string => ($active ? 'rgba(240, 185, 11, 0.14)' : Color.explorer_bg)};
  color: ${({ $active }): string => ($active ? Color.neutral100 : LABEL_COLOR)};
  border-radius: 8px;
  height: 1.62rem;
  padding: 0 0.62rem;
  font-size: 1.2rem;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;

  &:hover:not(:disabled) {
    background: ${({ $active }): string => ($active ? 'rgba(240, 185, 11, 0.22)' : Color.explorer_bgButtonHover)};
    border-color: ${({ $active }): string => ($active ? Color.explorer_yellow4 : LABEL_COLOR)};
    color: ${Color.neutral100};
  }

  &:focus-visible {
    outline: 2px solid ${Color.explorer_yellow4};
    outline-offset: 1px;
  }

  &:disabled {
    opacity: 0.45;
    cursor: default;
  }
`

const SolverMeta = styled.div`
  color: ${SUBLINE_COLOR};
  font-size: 1.2rem;
  line-height: 1.2;
  text-align: right;

  @media (max-width: 620px) {
    text-align: left;
  }
`

type BatchSummaryBarProps = {
  batchInsights: BatchInsights
  solverLabel?: string
  layoutMode: LayoutMode
  onToggleLayoutMode: (mode: LayoutMode) => void
  showUsdValues: boolean
  onToggleUsdValues: (showUsdValues: boolean) => void
}

export function BatchSummaryBar({
  batchInsights,
  solverLabel,
  layoutMode,
  onToggleLayoutMode,
  showUsdValues,
  onToggleUsdValues,
}: BatchSummaryBarProps): ReactNode {
  const { orderCount, surplusOrdersCount, hasUsdEstimates } = batchInsights
  const surplusValueLabel = `${surplusOrdersCount} of ${orderCount}`
  const cowStat = getCowStatData(batchInsights)

  return (
    <Wrapper>
      <StatsGrid>
        <StatGroup data-kind="orders">
          <HeroLine>
            <HeroValue>{orderCount}</HeroValue>
          </HeroLine>
          <StatLabel>orders</StatLabel>
        </StatGroup>

        <StatGroup data-kind="surplus">
          <HeroLine>
            <HeroSurplusValue>{surplusValueLabel}</HeroSurplusValue>
          </HeroLine>
          <StatLabel>with surplus ✨</StatLabel>
        </StatGroup>

        <StatGroup data-kind="cow">
          <HeroLine>
            <HeroCowValue>{cowStat.valueLabel}</HeroCowValue>
          </HeroLine>
          <StatLabel>
            {cowStat.primaryLabel}{' '}
            {cowStat.showHeuristicHint ? (
              <HeuristicHint title="Heuristic estimate (solver-level confirmation not available).">ⓘ</HeuristicHint>
            ) : null}
          </StatLabel>
        </StatGroup>
      </StatsGrid>

      <ControlsColumn>
        <ControlsPanel>
          <SegmentedGroup>
            <SegmentedButton
              $active={layoutMode === LayoutMode.COMPACT}
              aria-pressed={layoutMode === LayoutMode.COMPACT}
              onClick={(): void => onToggleLayoutMode(LayoutMode.COMPACT)}
              type="button"
            >
              Sankey
            </SegmentedButton>
            <SegmentedButton
              $active={layoutMode === LayoutMode.GRAPH}
              aria-pressed={layoutMode === LayoutMode.GRAPH}
              onClick={(): void => onToggleLayoutMode(LayoutMode.GRAPH)}
              type="button"
            >
              Legacy
            </SegmentedButton>
          </SegmentedGroup>

          <UsdToggleButton
            $active={showUsdValues}
            aria-pressed={showUsdValues}
            disabled={!hasUsdEstimates}
            onClick={(): void => onToggleUsdValues(!showUsdValues)}
            type="button"
          >
            {showUsdValues ? 'USD: On' : 'USD: Off'}
          </UsdToggleButton>
        </ControlsPanel>

        {solverLabel ? <SolverMeta>{solverLabel}</SolverMeta> : null}
      </ControlsColumn>
    </Wrapper>
  )
}

type CowStatData = {
  valueLabel: string
  primaryLabel: string
  secondaryLabel?: string
  showHeuristicHint: boolean
}

function getCowStatData(batchInsights: BatchInsights): CowStatData {
  const { cowFlow, hasPossibleCow, possibleCowTokenLabels } = batchInsights
  const hasCowVolume = !!cowFlow?.matchedAmountValue

  return {
    valueLabel: hasCowVolume ? cowFlow.matchedAmountLabel : hasPossibleCow ? 'Possible' : '0',
    primaryLabel: hasCowVolume
      ? 'matched P2P 🐮'
      : hasPossibleCow
        ? `possible P2P ${possibleCowTokenLabels.join(', ')} 🐮`
        : 'no P2P',
    secondaryLabel: hasCowVolume
      ? cowFlow.estimatedLpFeeSavingsUsd > 0
        ? `~$${formatUsd(cowFlow.estimatedLpFeeSavingsUsd)} LP fees saved`
        : undefined
      : undefined,
    showHeuristicHint: !hasCowVolume && hasPossibleCow,
  }
}

function formatUsd(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 2 })}M`
  }

  if (value >= 1_000) {
    return value.toLocaleString(undefined, { maximumFractionDigits: 0 })
  }

  return value.toLocaleString(undefined, { maximumFractionDigits: 2 })
}
