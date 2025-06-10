import { InlineBanner, InlineBannerProps } from '../../containers/InlineBanner'
import { ClosableBanner } from '../ClosableBanner'

interface DismissableInlineBannerProps extends Omit<InlineBannerProps, 'onClose'> {
  bannerId: string
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function DismissableInlineBanner(props: DismissableInlineBannerProps) {
  return ClosableBanner(props.bannerId, (onClose) => {
    return <InlineBanner {...props} onClose={onClose} />
  })
}
