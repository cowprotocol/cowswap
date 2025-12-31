import { Media, UI } from '@cowprotocol/ui'

import CROSS_CHAIN_BG from 'assets/cross-chain-unlock-bg.svg'
import styled from 'styled-components/macro'

export const Container = styled.div<{ darkMode: boolean }>`
  padding: 24px;
  border-radius: 16px;
  background: ${({ darkMode }) => (darkMode ? `var(${UI.COLOR_PAPER_DARKER})` : `var(${UI.COLOR_BLUE_100_PRIMARY})`)};
  display: grid;
  grid-template-columns: auto auto;
  gap: 32px;
  align-items: center;
  min-height: 235px;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url(${CROSS_CHAIN_BG}) calc(100% - -12px) center/contain no-repeat;
    opacity: ${({ darkMode }) => (darkMode ? 0.5 : 1)};
    pointer-events: none;
    z-index: 0;
  }

  ${Media.upToMedium()} {
    &::before {
      background-position: 100% center;
    }
  }

  ${Media.upToSmall()} {
    &::before {
      background-position: 155px center;
      background-size: 300px auto;
    }
  }
`

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
  position: relative;
  z-index: 1;
`

export const Title = styled.h2`
  color: inherit;
  font-size: 34px;
  font-weight: 800;
  hyphens: auto;
  line-height: 1.2;
  margin: 0;
  overflow-wrap: normal;
  word-break: normal;

  ${Media.upToMedium()} {
    font-size: 28px;
  }

  ${Media.upToSmall()} {
    font-size: 24px;
  }
`

export const Subtitle = styled.h3`
  color: inherit;
  font-size: 21px;
  font-weight: 400;
  hyphens: auto;
  line-height: 1.4;
  margin: 0;
  opacity: 0.8;
  overflow-wrap: normal;
  word-break: normal;

  ${Media.upToMedium()} {
    font-size: 18px;
  }

  ${Media.upToSmall()} {
    font-size: 16px;
  }
`

export const ButtonWrapper = styled.div`
  button {
    min-width: 160px;
    padding: 12px 24px;
    font: 600 16px/1 inherit;
  }
`

export const Illustration = styled.div`
  --width: 120px;
  width: var(--width);
  height: 100%;
  max-width: 100%;
  flex-shrink: 0;
  position: relative;
  z-index: 2;

  svg {
    width: 100%;
    height: 100%;
    display: block;
  }

  ${Media.upToMedium()} {
    --width: 100px;
  }

  ${Media.upToSmall()} {
    --width: 90px;
    margin: 0 auto;
  }
`
