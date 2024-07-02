import React from 'react'

import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styled from 'styled-components/macro'

const TabIconWrapper = styled.div`
  svg {
    margin-right: 0.6rem;
  }
`

export default function TabIcon({ title, iconFontName }: { title: string; iconFontName: IconProp }): JSX.Element {
  return (
    <TabIconWrapper>
      <FontAwesomeIcon icon={iconFontName} />
      {title}
    </TabIconWrapper>
  )
}
