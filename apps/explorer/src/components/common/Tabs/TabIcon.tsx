import React from 'react'

import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { TabIconWrapper } from './styled'

export default function TabIcon({ title, iconFontName }: { title: string; iconFontName: IconProp }): React.ReactNode {
  return (
    <TabIconWrapper>
      <FontAwesomeIcon icon={iconFontName} />
      {title}
    </TabIconWrapper>
  )
}
