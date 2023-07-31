import { WrappingPreview } from './index'
import { wrappingPreviewProps } from '../../../services/ethFlow/mocks'

const Fixtures = {
  withBalance: <WrappingPreview {...wrappingPreviewProps} />,
  unknonwnBalance: <WrappingPreview {...wrappingPreviewProps} nativeBalance={undefined} wrappedBalance={undefined} />,
}

export default Fixtures
