import { BannerOrientation, InlineBanner } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

const StyledInlineBanner = styled(InlineBanner)`
  --cow-color-danger-text: ${({ theme }): string => theme.alert2};
`

export const UnsignedOrderWarning: React.FC = () => {
  return (
    <StyledInlineBanner orientation={BannerOrientation.Horizontal} bannerType="danger" padding="0">
      An unsigned order is not necessarily placed by the owner's account. Please be cautious.
    </StyledInlineBanner>
  )
}
