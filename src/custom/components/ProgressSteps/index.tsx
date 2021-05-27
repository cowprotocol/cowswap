import React from 'react'
import styled from 'styled-components'

import ProgressCirclesUni, { Circle as CircleUni, ProgressCirclesProps } from './ProgressStepsMod'

export const Circle = styled(CircleUni)`
  color: ${({ theme, confirmed, disabled }) => (disabled ? theme.text1 : confirmed ? theme.white : theme.text1)};
`

export default function ProgressCircles(props: Omit<ProgressCirclesProps, 'CircleComponent'>) {
  return <ProgressCirclesUni {...props} CircleComponent={Circle} />
}
