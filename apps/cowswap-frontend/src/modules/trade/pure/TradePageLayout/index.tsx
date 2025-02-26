import { Media, UI, MY_ORDERS_ID } from '@cowprotocol/ui'

import styled from 'styled-components/macro'
import { WIDGET_MAX_WIDTH } from 'theme'

const DEFAULT_MAX_WIDTH = '1500px'

export const PageWrapper = styled.div<{
  isUnlocked: boolean
  secondaryOnLeft?: boolean
  maxWidth?: string
  hideOrdersTable?: boolean
}>`
  width: 100%;
  display: grid;
  max-width: ${({ maxWidth = DEFAULT_MAX_WIDTH }) => maxWidth};
  margin: 0 auto;
  grid-template-columns: 1fr;
  grid-template-rows: auto;
  grid-template-areas: ${({ hideOrdersTable }) => (hideOrdersTable ? '"primary"' : '"primary" "secondary"')};
  gap: 20px;

  ${Media.LargeAndUp()} {
    grid-template-columns: ${({ isUnlocked, hideOrdersTable, secondaryOnLeft }) =>
      isUnlocked && !hideOrdersTable
        ? secondaryOnLeft
          ? '1fr minmax(auto, ' + WIDGET_MAX_WIDTH.swap.replace('px', '') + 'px)'
          : 'minmax(auto, ' + WIDGET_MAX_WIDTH.swap.replace('px', '') + 'px) 1fr'
        : '1fr'};
    grid-template-rows: 1fr;
    grid-template-areas: ${({ secondaryOnLeft, hideOrdersTable }) =>
      hideOrdersTable ? '"primary"' : secondaryOnLeft ? '"secondary primary"' : '"primary secondary"'};
  }

  > div:last-child {
    display: ${({ isUnlocked }) => (!isUnlocked ? 'none' : '')};
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
export const SecondaryWrapper = styled.div.attrs({
  id: MY_ORDERS_ID,
})`
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
  height: 100%;
  width: 100%;
  margin: 0 0 76px;
  grid-area: secondary;

  ${Media.upToLargeAlt()} {
    flex-flow: column wrap;
    margin: 0 0 20px;
  }
`
