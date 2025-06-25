import React from 'react'

import { PercentDisplay } from '@cowprotocol/ui/pure/PercentDisplay'

import { Wrapper, Props } from './styled'

export function ProgressBar(props: Props): React.ReactNode {
  const { percentage = '0', showLabel = true } = props

  return (
    <Wrapper {...props}>
      <div className="progress-line">
        <span></span>
      </div>
      {showLabel && (
        <b>
          <PercentDisplay percent={percentage} />
        </b>
      )}
    </Wrapper>
  )
}
