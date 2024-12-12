import { Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'
import { WIDGET_MAX_WIDTH } from 'theme'

export const PageWrapper = styled.div<{ isUnlocked: boolean; secondaryOnLeft?: boolean }>`
  width: 100%;
  display: grid;
  max-width: 1500px;
  margin: 0 auto;
  grid-template-columns: ${({ isUnlocked, secondaryOnLeft }) =>
    isUnlocked ? (secondaryOnLeft ? '1fr ' + WIDGET_MAX_WIDTH.swap : WIDGET_MAX_WIDTH.swap + ' 1fr') : ''};
  grid-template-rows: 1fr;
  grid-template-areas: ${({ secondaryOnLeft }) => (secondaryOnLeft ? '"secondary primary"' : '"primary secondary"')};
  grid-column-gap: 20px;

  ${Media.upToLarge()} {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    grid-template-areas: ${({ secondaryOnLeft }) =>
      secondaryOnLeft ? '"secondary" "primary"' : '"primary" "secondary"'};
  }

  > div:last-child {
    display: ${({ isUnlocked }) => (isUnlocked ? '' : 'none')};
  }
`

// Form + banner
export const PrimaryWrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  gap: 16px;
  width: 100%;
  max-width: ${WIDGET_MAX_WIDTH.swap};
  margin: 0 auto;
  color: inherit;
  grid-area: primary;
`

// Graph + orders table
export const SecondaryWrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 100%;
  overflow: hidden;
  border-radius: var(${UI.BORDER_RADIUS_NORMAL});
  background: var(${UI.COLOR_PAPER});
  color: inherit;
  border: none;
  box-shadow: none;
  position: relative;
  padding: 10px;
  min-height: 200px;
  width: 100%;
  margin: 0 0 76px;
  grid-area: secondary;

  ${Media.upToLargeAlt()} {
    flex-flow: column wrap;
    margin: 0 0 20px;
  }
`
