import { WrappingPreview } from '.'

import { wrappingPreviewProps } from '../../mocks'

const Fixtures = {
  withBalance: <WrappingPreview {...wrappingPreviewProps} />,
  unknonwnBalance: <WrappingPreview {...wrappingPreviewProps} nativeBalance={undefined} wrappedBalance={undefined} />,
}

export default Fixtures
