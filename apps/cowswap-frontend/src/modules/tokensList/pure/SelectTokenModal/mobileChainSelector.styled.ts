import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { ListTitle } from './styled'

import type { ChainAccentVars } from '../ChainsSelector/styled'

const fallbackBackground = `var(${UI.COLOR_PRIMARY_OPACITY_10})`
const fallbackBorder = `var(${UI.COLOR_PRIMARY_OPACITY_50})`

const getBackground = (accent?: ChainAccentVars): string =>
  accent ? `var(${accent.backgroundVar})` : fallbackBackground
const getBorder = (accent?: ChainAccentVars): string => (accent ? `var(${accent.borderVar})` : fallbackBorder)

export const MobileSelectorRow = styled.div`
  padding: 0 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

export const MobileSelectorLabel = styled(ListTitle)`
  padding: 4px 0;
  justify-content: flex-start;
  gap: 6px;
  flex-wrap: wrap;
`

export const ActiveChainLabel = styled.span`
  color: var(${UI.COLOR_TEXT});
  font-weight: 600;
  font-size: 14px;
`

export const ScrollContainer = styled.div`
  --cta-width: min(45vw, 130px);
  --fade-width: clamp(14px, 6vw, 32px);
  --cta-gap: 2px;
  --cta-offset: calc(var(--cta-width) + var(--cta-gap));
  position: relative;
  min-height: 44px;
  overflow: hidden;
  padding-right: var(--cta-offset);
`

export const ScrollArea = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  overflow-x: auto;
  overflow-y: hidden;
  padding-right: var(--fade-width);
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-snap-type: x proximity;

  &::-webkit-scrollbar {
    display: none;
  }

  mask-image: linear-gradient(
    90deg,
    #000 0%,
    #000 calc(100% - var(--cta-offset) - var(--fade-width)),
    rgba(0, 0, 0, 0) 100%
  );
  -webkit-mask-image: linear-gradient(
    90deg,
    #000 0%,
    #000 calc(100% - var(--cta-offset) - var(--fade-width)),
    rgba(0, 0, 0, 0) 100%
  );
`

export const FixedAllNetworks = styled.div`
  pointer-events: none;
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  width: var(--cta-width);
  display: flex;
  align-items: center;
  justify-content: flex-end;

  > button {
    pointer-events: auto;
    width: 100%;
    position: relative;
    z-index: 1;
  }
`

export const ChainChipButton = styled.button<{ $active?: boolean; $accent?: ChainAccentVars; $disabled?: boolean }>`
  --size: 44px;
  width: var(--size);
  height: var(--size);
  border-radius: 10px;
  border: 2px solid ${({ $active, $accent }) => ($active ? getBorder($accent) : 'transparent')};
  background: ${({ $active, $accent }) => ($active ? getBackground($accent) : 'transparent')};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
  transition:
    border 0.2s ease,
    background 0.2s ease,
    opacity 0.2s ease;
  flex-shrink: 0;
  scroll-snap-align: start;

  > img {
    --size: 100%;
    width: var(--size);
    height: var(--size);
    object-fit: contain;
  }
`

export const MoreChipButton = styled.button`
  --size: 44px;
  height: var(--size);
  padding: 0 12px;
  border-radius: var(--size);
  border: 1px solid var(${UI.COLOR_PAPER_DARKEST});
  background: var(${UI.COLOR_PAPER});
  color: var(${UI.COLOR_TEXT});
  font-weight: 600;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;

  svg {
    --size: 18px;
    stroke: var(${UI.COLOR_TEXT_OPACITY_50});
    width: var(--size);
    height: var(--size);
    min-width: var(--size);
    min-height: var(--size);
  }
`
