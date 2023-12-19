import { useContext } from 'react'

import { transparentize } from 'color2k'
import Snowfall from 'react-snowfall'
import { ThemeContext } from 'styled-components/macro'

export function WinterFooter() {
  const theme = useContext(ThemeContext as React.Context<any>)
  return <Snowfall color={transparentize(theme.text, 0.7)} snowflakeCount={50} />
}
