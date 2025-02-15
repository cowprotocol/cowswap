import { wrappingPreviewProps } from '../../services/ethFlow/mocks'

import { WrappingPreview } from './index'

const Fixtures = {
  withBalance: <WrappingPreview {...wrappingPreviewProps} />,
  unknonwnBalance: <WrappingPreview {...wrappingPreviewProps} nativeBalance={undefined} wrappedBalance={undefined} />,
}

export default Fixtures
