import { useContext } from 'react'
import { ThemeContext } from 'styled-components/macro'
import Snowfall from 'react-snowfall'
import { transparentize } from 'polished'

export function WinterFooter() {
  const theme = useContext(ThemeContext)
  return <Snowfall color={transparentize(0.7, theme.text1)} snowflakeCount={50} />
}
