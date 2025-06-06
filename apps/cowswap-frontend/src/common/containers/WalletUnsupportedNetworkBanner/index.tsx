import { UI, Media } from '@cowprotocol/ui'

import { AlertCircle } from 'react-feather'
import styled from 'styled-components/macro'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import { useUnsupportedNetworksText } from '../../hooks/useUnsupportedNetworksText'

const Wrapper = styled.div`
  position: fixed;
  right: 20px;
  top: 100px;
  display: flex;
  background: var(${UI.COLOR_DANGER_BG});
  color: var(${UI.COLOR_DANGER_TEXT});
  backdrop-filter: blur(10px);
  z-index: 3;
  width: 360px;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border-radius: 10px;
  border: 1px solid var(${UI.COLOR_DANGER});
  box-shadow: var(${UI.BOX_SHADOW});

  ${Media.upToMedium()} {
    left: 10px;
    right: 0;
    width: calc(100vw - 20px);
    bottom: 72px;
    top: initial;
  }
`

const StyledAlertCircle = styled(AlertCircle)`
  color: var(${UI.COLOR_DANGER});
`

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function WalletUnsupportedNetworkBanner() {
  const isChainIdUnsupported = useIsProviderNetworkUnsupported()
  const unsupportedNetworksText = useUnsupportedNetworksText()

  return (
    <>
      {isChainIdUnsupported && (
        <Wrapper>
          <div>
            <StyledAlertCircle size={24} />
          </div>
          <div>{unsupportedNetworksText}</div>
        </Wrapper>
      )}
    </>
  )
}
