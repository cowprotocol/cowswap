import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import type { ChainAccentVars } from '../ChainsSelector/styled'

const fallbackBackground = `var(${UI.COLOR_PRIMARY_OPACITY_10})`
const fallbackBorder = `var(${UI.COLOR_PRIMARY_OPACITY_50})`

const getBackground = (accent?: ChainAccentVars): string =>
  accent ? `var(${accent.backgroundVar})` : fallbackBackground
const getBorder = (accent?: ChainAccentVars): string => (accent ? `var(${accent.borderVar})` : fallbackBorder)

export const MobileSelectorRow = styled.div`
  padding: 0 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

export const MobileSelectorLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

export const ChipsWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

export const ChainChipButton = styled.button<{ $active?: boolean; $accent?: ChainAccentVars }>`
  --size: 44px;
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
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
    width: 70%;
    height: 70%;
    object-fit: contain;
  }
`

export const MoreChipButton = styled.button`
  --size: 44px;
  height: var(--size);
  min-width: var(--size);
  padding: 0 14px;
  border-radius: var(--size);
  border: 1px dashed var(${UI.COLOR_BORDER});
  background: transparent;
  color: var(${UI.COLOR_TEXT});
  font-weight: 600;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`
