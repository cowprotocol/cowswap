import styled, { css } from 'styled-components/macro'

/** Intrinsic Figma vessel size; aspect-ratio keeps the SVG from collapsing when % height is indefinite. */
const VESSEL_WIDTH_PX = 150
const VESSEL_HEIGHT_PX = 210
const STACKED_GLASS_WIDTH_PX = 86
const STACKED_GLASS_HEIGHT_PX = 120

export const Root = styled.div`
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  padding: 12px 16px;
  overflow: hidden;
`

export const Row = styled.div<{ $stacked?: boolean }>`
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row;
  align-items: center;
  align-content: center;
  justify-content: center;
  gap: 32px;
  flex: 1;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  max-height: 100%;

  ${({ $stacked }) =>
    $stacked &&
    css`
      flex-direction: column;
      gap: 8px;
    `}
`

export const TimerColumn = styled.div<{ $stacked?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: start;
  gap: 4px;
  width: 204px;
  flex: 0 1 204px;
  min-width: 0;

  ${({ $stacked }) =>
    $stacked &&
    css`
      width: auto;
      flex: 0 0 auto;
      align-items: center;
      text-align: center;
    `}
`

export const TimerLabel = styled.span`
  font-size: 13px;
  line-height: 18px;
  width: 100%;
`

export const GlassBox = styled.div<{ $stacked?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 0 1 auto;
  min-width: 0;
  min-height: 0;
  width: ${VESSEL_WIDTH_PX}px;
  max-width: ${VESSEL_WIDTH_PX}px;
  max-height: 100%;
  aspect-ratio: ${VESSEL_WIDTH_PX} / ${VESSEL_HEIGHT_PX};
  height: auto;

  > svg {
    display: block;
    width: 100%;
    height: 100%;
    max-width: none;
    max-height: none;
  }

  ${({ $stacked }) =>
    $stacked &&
    css`
      flex: 0 0 auto;
      width: ${STACKED_GLASS_WIDTH_PX}px;
      height: ${STACKED_GLASS_HEIGHT_PX}px;
      max-width: ${STACKED_GLASS_WIDTH_PX}px;
      max-height: ${STACKED_GLASS_HEIGHT_PX}px;
      aspect-ratio: auto;

      > svg {
        width: ${STACKED_GLASS_WIDTH_PX}px;
        height: ${STACKED_GLASS_HEIGHT_PX}px;
      }
    `}
`
