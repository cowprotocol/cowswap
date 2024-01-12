import React from 'react'
import Grid, { GridProps } from '@material-ui/core/Grid'

export type CardRowProps = React.PropsWithChildren<GridProps>

/**
 * CardRow component.
 *
 * Place cards side-by-side
 */
export const CardRow: React.FC<CardRowProps> = ({ children, ...rest }) => {
  return (
    <Grid container {...rest}>
      {children}
    </Grid>
  )
}
