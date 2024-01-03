import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { SizeProp } from '@fortawesome/fontawesome-svg-core'

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
