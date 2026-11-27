import { ExternalLink, Toggle, UI, font } from '@cowprotocol/ui'

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
          border-color: transparent;
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
  ${font('FONT_MEDIUM', 600)}
`

export const TitleAmount = styled.span`
  color: var(${UI.COLOR_SUCCESS_TEXT});
`

export const TitleTooltip = styled.span`
  vertical-align: middle;
`

export const DescriptionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`

export const NextBatch = styled.span`
  ${font('FONT_SMALL_PLUS', 400)}
  color: var(${UI.COLOR_TEXT_SECONDARY});
`

export const NoVolumeFee = styled.span<{ $active: boolean }>`
  ${({ $active }) => font('FONT_SMALL_PLUS', $active ? 600 : 400)}
  color: ${({ $active }) => ($active ? `var(${UI.COLOR_SUCCESS_TEXT})` : `var(${UI.COLOR_TEXT_SECONDARY})`)};
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

  &:hover {
    text-decoration-style: dotted;
  }
`

export const WaitAndSaveToggle = styled(Toggle)`
  flex: 0 0 auto;
`

export const TooltipContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  > p {
    margin: 0;
  }
`

export const DocsLink = styled(ExternalLink)`
  font-size: inherit;
  line-height: inherit;
  font-weight: var(${UI.FONT_WEIGHT_MEDIUM});
  color: var(${UI.COLOR_TEXT});
  text-decoration: underline;
  text-decoration-skip-ink: auto;

  &:hover,
  &:focus,
  &:active {
    text-decoration: underline;
  }
`
