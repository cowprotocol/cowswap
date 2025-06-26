import { ReactNode } from 'react'

import { ClosableBanner } from '../ClosableBanner'
import { InlineBanner, InlineBannerProps } from '../InlineBanner'

interface DismissableInlineBannerProps extends Omit<InlineBannerProps, 'onClose'> {
  bannerId: string
}

export function DismissableInlineBanner(props: DismissableInlineBannerProps): ReactNode {
  return ClosableBanner(props.bannerId, (onClose) => {
    return <InlineBanner {...props} onClose={onClose} />
  })
}
