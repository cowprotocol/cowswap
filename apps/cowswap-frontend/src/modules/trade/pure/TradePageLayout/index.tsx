import { Media, UI, MY_ORDERS_ID } from '@cowprotocol/ui'

import styled, { css } from 'styled-components/macro'
import { WIDGET_MAX_WIDTH } from 'theme'

const DEFAULT_MAX_WIDTH = '1500px'

export const PageWrapper = styled.div<{
  isUnlocked: boolean
  secondaryOnLeft?: boolean
  maxWidth?: string
  hideOrdersTable?: boolean
  /** When true, widget and orders table are always stacked (one column); widget stays in same position as Swap/Yield */
  stacked?: boolean
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
    grid-template-columns: ${({ isUnlocked, hideOrdersTable, secondaryOnLeft, stacked }) =>
      stacked
        ? '1fr'
        : isUnlocked && !hideOrdersTable
          ? secondaryOnLeft
            ? '1fr minmax(auto, ' + WIDGET_MAX_WIDTH.swap.replace('px', '') + 'px)'
            : 'minmax(auto, ' + WIDGET_MAX_WIDTH.swap.replace('px', '') + 'px) 1fr'
          : '1fr'};
    grid-template-rows: ${({ stacked, hideOrdersTable }) => (stacked && !hideOrdersTable ? 'auto 1fr' : '1fr')};
    grid-template-areas: ${({ secondaryOnLeft, hideOrdersTable, stacked }) =>
      stacked
        ? hideOrdersTable
          ? '"primary"'
          : '"primary" "secondary"'
        : hideOrdersTable
          ? '"primary"'
          : secondaryOnLeft
            ? '"secondary primary"'
            : '"primary secondary"'};
  }

  > .trade-orders-table {
    display: ${({ isUnlocked }) => (!isUnlocked ? 'none' : '')};
    grid-area: secondary;
    flex: 1;
    min-height: 200px;
    height: 100%;
    max-height: 100%;
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
})<{ $inDrawer?: boolean }>`
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  border-radius: ${({ $inDrawer }) => ($inDrawer ? '0' : `var(${UI.BORDER_RADIUS_NORMAL})`)};
  background: var(${UI.COLOR_PAPER});
  color: inherit;
  border: none;
  box-shadow: none;
  position: relative;
  padding: 0;
  overflow: hidden;

  ${({ $inDrawer }) =>
    $inDrawer
      ? css`
          /* Grow with table content so Modal.Root can scroll the whole body */
          flex: 0 0 auto;
        `
      : css`
          flex: 1;
          min-height: 0;
          height: 100%;
        `}
`
