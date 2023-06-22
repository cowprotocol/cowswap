import { PropsWithChildren } from 'react'

import { return5 } from '@cowprotocol/ui-utils'

/* eslint-disable-next-line */
export interface UiProps extends PropsWithChildren {}

export function PinkTitle(props: UiProps) {
  return (
    <div style={{ border: '1px solid pink', height: '150px', width: '100%' }}>
      <h1 style={{ color: 'pink' }}>
        {props.children} (return5 = {return5()})
      </h1>
    </div>
  )
}
