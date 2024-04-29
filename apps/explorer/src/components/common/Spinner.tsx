import React from 'react'

import { SizeProp } from '@fortawesome/fontawesome-svg-core'
import { faSpinner, IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export interface SpinnerProps {
  spin?: boolean
  style?: React.CSSProperties
  size?: SizeProp
  icon?: IconDefinition
}

export const Spinner: React.FC<SpinnerProps> = ({ style, spin = true, size, icon = faSpinner }) => (
  <FontAwesomeIcon icon={icon} style={style} spin={spin} size={size} />
)

export default Spinner
