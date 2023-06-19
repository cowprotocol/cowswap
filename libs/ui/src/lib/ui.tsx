import { PropsWithChildren } from 'react'
import { return5 } from '@cowprotocol/ui-utils'

/* eslint-disable-next-line */
export interface UiProps extends PropsWithChildren {}

export function PinkTitle(props: UiProps) {
  return (
    <div>
      <h1 style={{ color: 'pink' }}>
        {props.children} (return5 = {return5()})
      </h1>
    </div>
  )
}

export default PinkTitle
