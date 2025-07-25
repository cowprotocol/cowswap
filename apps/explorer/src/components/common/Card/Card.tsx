import { Media, Color, UI } from '@cowprotocol/ui'

import Grid, { GridSize } from '@material-ui/core/Grid'
import styled from 'styled-components/macro'

const DefaultCard = styled.div`
  height: inherit;
  min-width: 13rem;
  min-height: 10rem;
  background-color: ${Color.explorer_bgInput};
  border-radius: 6px;
  box-shadow:
    0 10px 15px -3px ${Color.explorer_boxShadow},
    0 4px 6px -2px ${Color.explorer_boxShadow};
  margin: 0.8rem;

  ${Media.upToSmall()} {
    min-width: 14rem;
    min-height: 9.8rem;
  }
`

const CardComponent = styled(DefaultCard)`
  display: flex;
  flex-direction: column;
  border-top-right-radius: 6px;
  border-top-left-radius: 6px;
  background: ${Color.explorer_bgInput};
  color: var(${UI.COLOR_NEUTRAL_100});
`

// CARD CONTENT STYLES
const CardContent = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
  padding: 1rem;
  line-height: normal;

  ${Media.upToExtraSmall()} {
    padding: 0.2rem;
    font-size: 1.1rem;
  }
`

enum CardSize {
  xs = 12,
  sm = 6,
  md = 4,
  lg = 3,
}

export interface CardBaseProps {
  children?: React.ReactNode
  emptyContent?: boolean
  xs?: GridSize
  sm?: GridSize
  md?: GridSize
  lg?: GridSize
}

/**
 * Card component.
 *
 * An extensible content container.
 */
export const Card: React.FC<CardBaseProps> = ({
  children,
  emptyContent = false,
  xs = CardSize.xs,
  sm = CardSize.sm,
  md = CardSize.md,
  lg = CardSize.lg,
  ...rest
}): React.ReactNode => {
  return (
    <Grid item xs={xs} sm={sm} md={md} lg={lg}>
      {emptyContent ? (
        children
      ) : (
        <CardComponent {...rest}>
          <CardContent>{children}</CardContent>
        </CardComponent>
      )}
    </Grid>
  )
}
