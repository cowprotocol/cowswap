import { ReactNode } from 'react'

import { getChainInfo, SOLANA_ALPHA_MAX_TRADE_SIZE_USD } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import {
  Badge,
  BadgeTypes,
  ButtonOutlined,
  ButtonPrimary,
  InlineBanner,
  ModalHeader,
  StatusColorVariant,
} from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import * as styledEl from './styled'

export interface SolanaAlphaRiskModalProps {
  isDarkMode: boolean
  requiresAcknowledgement: boolean

  onAcknowledge(): void

  onGoBack(): void

  onClose(): void
}

export function SolanaAlphaRiskModal(props: SolanaAlphaRiskModalProps): ReactNode {
  const { isDarkMode, requiresAcknowledgement, onAcknowledge, onGoBack, onClose } = props

  const solanaInfo = getChainInfo(SupportedChainId.SOLANA)
  const maxTradeSize = SOLANA_ALPHA_MAX_TRADE_SIZE_USD.toLocaleString('en-US')

  return (
    <styledEl.Wrapper>
      <ModalHeader>
        <Trans>CoW Swap on Solana is in Alpha</Trans>
      </ModalHeader>
      <styledEl.Contents>
        <styledEl.NetworkBlock>
          <styledEl.NetworkLogo
            src={isDarkMode ? solanaInfo.logo.dark : solanaInfo.logo.light}
            alt={solanaInfo.label}
          />
          <styledEl.NetworkLabel>{solanaInfo.label}</styledEl.NetworkLabel>
          <Badge type={BadgeTypes.ALERT2}>
            <Trans>ALPHA</Trans>
          </Badge>
        </styledEl.NetworkBlock>
        <InlineBanner bannerType={StatusColorVariant.Alert} iconSize={24}>
          <p>
            <Trans>
              This is an alpha version of CoW Swap on Solana. This deployment has not yet been independently audited and
              may contain bugs, vulnerabilities or unexpected behaviour that could result in failed transactions or
              partial or total loss of assets.
            </Trans>
          </p>
          <p>
            <Trans>Maximum trade size: ${maxTradeSize} per swap.</Trans>
          </p>
        </InlineBanner>
        <styledEl.ButtonContainer>
          {requiresAcknowledgement ? (
            <>
              <ButtonPrimary onClick={onAcknowledge}>
                <Trans>I understand</Trans>
              </ButtonPrimary>
              <ButtonOutlined onClick={onGoBack}>
                <Trans>Go back</Trans>
              </ButtonOutlined>
            </>
          ) : (
            <ButtonPrimary onClick={onClose}>
              <Trans>Close</Trans>
            </ButtonPrimary>
          )}
        </styledEl.ButtonContainer>
      </styledEl.Contents>
    </styledEl.Wrapper>
  )
}
