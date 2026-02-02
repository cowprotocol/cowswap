import { ReactNode } from 'react'

import { Media, UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import { AlertCircle } from 'react-feather'
import styled from 'styled-components/macro'

import { AFFILIATE_SUPPORTED_NETWORK_NAMES } from '../config/constants'
import { useTraderReferralCode } from '../model/hooks/useTraderReferralCode'

const Wrapper = styled.div`
  position: fixed;
  right: 20px;
  top: 100px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  max-width: 360px;
  border-radius: 12px;
  border: 1px solid var(${UI.COLOR_DANGER});
  background: var(${UI.COLOR_DANGER_BG});
  color: var(${UI.COLOR_DANGER_TEXT});
  box-shadow: var(${UI.BOX_SHADOW});
  backdrop-filter: blur(12px);
  z-index: 30;

  ${Media.upToMedium()} {
    left: 10px;
    right: 10px;
    top: auto;
    bottom: 80px;
    width: auto;
  }
`

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  > svg {
    color: var(${UI.COLOR_DANGER});
  }
`

const Message = styled.div`
  font-size: var(${UI.FONT_SIZE_NORMAL});
  line-height: 1.4;
`

export interface TraderReferralCodeNetworkBannerProps {
  forceVisible?: boolean
  onlyWhenUnsupported?: boolean
}

export function TraderReferralCodeNetworkBanner(props: TraderReferralCodeNetworkBannerProps): ReactNode {
  const { forceVisible = false, onlyWhenUnsupported = false } = props
  const { modalOpen, wallet } = useTraderReferralCode()

  if (!forceVisible && !modalOpen) {
    return null
  }

  const shouldShow = onlyWhenUnsupported
    ? wallet.status === 'unsupported'
    : wallet.status === 'unsupported' || wallet.status === 'unknown' || wallet.status === 'disconnected'

  if (!shouldShow) {
    return null
  }

  const supportedNetworks = AFFILIATE_SUPPORTED_NETWORK_NAMES.join(', ')

  return (
    <Wrapper role="alert" aria-live="polite">
      <IconWrapper>
        <AlertCircle size={20} />
      </IconWrapper>
      <Message>
        <Trans>Please connect your wallet to one of our supported networks: {supportedNetworks}.</Trans>
      </Message>
    </Wrapper>
  )
}
