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
`

export const ChipsWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`

export const ChainChipButton = styled.button<{ $active?: boolean; $accent?: ChainAccentVars }>`
  --size: 44px;
  width: var(--size);
  height: var(--size);
  border-radius: 10px;
  border: 2px solid ${({ $active, $accent }) => ($active ? getBorder($accent) : 'transparent')};
  background: ${({ $active, $accent }) => ($active ? getBackground($accent) : 'transparent')};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    border 0.2s ease,
    background 0.2s ease;

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
  border: 1px solid var(${UI.COLOR_PAPER_DARKER});
  background: transparent;
  color: var(${UI.COLOR_TEXT});
  font-weight: 600;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  white-space: nowrap;

  svg {
    --size: 18px;
    stroke: var(${UI.COLOR_TEXT_OPACITY_50});
    width: var(--size);
    height: var(--size);
  }
`
