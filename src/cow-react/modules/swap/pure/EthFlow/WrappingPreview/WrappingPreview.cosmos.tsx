import { WrappingPreview } from '@cow/modules/swap/pure/EthFlow/WrappingPreview'
import { wrappingPreviewProps } from '@cow/modules/swap/services/ethFlow/mocks'

const Fixtures = {
  withBalance: <WrappingPreview {...wrappingPreviewProps} />,
  unknonwnBalance: <WrappingPreview {...wrappingPreviewProps} nativeBalance={undefined} wrappedBalance={undefined} />,
}

export default Fixtures
