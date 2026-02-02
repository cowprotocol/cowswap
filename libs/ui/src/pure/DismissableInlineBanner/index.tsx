import { ReactNode, useCallback } from 'react'

import { ClosableBanner } from '../ClosableBanner'
import { InlineBanner, InlineBannerProps } from '../InlineBanner'

interface DismissableInlineBannerProps extends Omit<InlineBannerProps, 'onClose'> {
  bannerId: string
}

export function DismissableInlineBanner(props: DismissableInlineBannerProps): ReactNode {
  const callback = useCallback((close: () => void) => <InlineBanner {...props} onClose={close} />, [...Object.values(props)])

  return (
    <ClosableBanner storageKey={props.bannerId} callback={callback } />
  )
}
