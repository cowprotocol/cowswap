import { Toggle, UI, font } from '@cowprotocol/ui'

import styled, { css, keyframes } from 'styled-components/macro'

const starTogglePop = keyframes`
  0% {
    transform: scale(1) rotate(0deg);
  }
  45% {
    transform: scale(2) rotate(180deg);
  }
  100% {
    transform: scale(1) rotate(360deg);
  }
`

const batchTimeShimmer = keyframes`
  from {
    background-position: 100% 0;
  }
  to {
    background-position: -100% 0;
  }
`

export const Wrapper = styled.div<{ $hasError?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 10px 6px;
  border: 1px solid var(${UI.COLOR_BORDER});
  border-radius: 12px;
  background: transparent;
  color: var(${UI.COLOR_TEXT});
  transition:
    background var(${UI.ANIMATION_DURATION}) ease-in-out,
    color var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:has(input:checked) {
    background: var(${UI.COLOR_SUCCESS_BG});
    color: var(${UI.COLOR_SUCCESS_TEXT});
  }

  ${({ $hasError }) =>
    $hasError
      ? css`
          background: var(${UI.COLOR_DANGER_BG});
          color: var(${UI.COLOR_DANGER_TEXT});
          border-color: var(${UI.COLOR_DANGER});
        `
      : undefined}
`

export const Content = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  min-width: 0;
`

export const Icon = styled.div<{ $animate: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  color: inherit;

  > svg {
    width: 100%;
    height: 100%;
    transform-origin: center;

    ${({ $animate }) =>
      $animate
        ? css`
            animation: ${starTogglePop} 0.45s ease;
          `
        : undefined}
  }

  > svg path {
    fill: currentColor;
  }

  @media (prefers-reduced-motion: reduce) {
    > svg {
      animation: none;
    }
  }
`

export const TextColumn = styled.div`
  display: flex;
  flex-flow: column wrap;
  gap: 2px;
  min-width: 0;
`

export const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  ${font('FONT_MEDIUM', 600)}
`

export const DescriptionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;

  strong {
    font-weight: var(${UI.FONT_WEIGHT_BOLD});
    color: var(${UI.COLOR_GREEN});
  }
`

export const SaveAmount = styled.span`
  ${font('FONT_SMALL_PLUS', 600)}
`

export const NextBatch = styled.span`
  ${font('FONT_SMALL_PLUS', 400)}
  color: var(${UI.COLOR_TEXT_SECONDARY});
`

export const BatchTimeSkeleton = styled.span`
  display: inline-block;
  width: 3.5em;
  height: 1em;
  vertical-align: -0.15em;
  border-radius: 4px;
  background-color: color-mix(in srgb, var(${UI.COLOR_PAPER_DARKER}) 48%, transparent);
  background-image: linear-gradient(
    105deg,
    transparent 28%,
    color-mix(in srgb, var(${UI.COLOR_TEXT}) 12%, transparent) 50%,
    transparent 72%
  );
  background-size: 220% 100%;
  animation: ${batchTimeShimmer} 2.8s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

export const ErrorColumn = styled.span`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
`

export const ScheduleError = styled.span`
  ${font('FONT_SMALL_PLUS', 400)}
  color: var(${UI.COLOR_DANGER_TEXT});
`

export const RetryButton = styled.button`
  ${font('FONT_SMALL_PLUS', 600)}
  padding: 0;
  border: 0;
  background: transparent;
  color: var(${UI.COLOR_DANGER_TEXT});
  cursor: pointer;
  text-decoration: underline;
`

export const FetchingBatchTime = styled.span`
  ${font('FONT_SMALL_PLUS', 600)}
  color: var(${UI.COLOR_DANGER_TEXT});
`

export const WaitAndSaveToggle = styled(Toggle)`
  flex: 0 0 auto;
`
