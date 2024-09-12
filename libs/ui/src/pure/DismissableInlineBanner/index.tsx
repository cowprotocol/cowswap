import { InlineBanner, InlineBannerProps } from '../../containers/InlineBanner'
import { ClosableBanner } from '../ClosableBanner'

interface DismissableInlineBannerProps extends Omit<InlineBannerProps, 'onClose'> {
  bannerId: string
}

export function DismissableInlineBanner(props: DismissableInlineBannerProps) {
  return ClosableBanner(props.bannerId, (onClose) => {
    return <InlineBanner {...props} onClose={onClose} />
  })
}
