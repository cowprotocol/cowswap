import { ReactNode } from 'react'

import { getChainInfo, SOLANA_ALPHA_MAX_TRADE_SIZE_USD_DISPLAY } from '@cowprotocol/common-const'
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

const SOLANA_INFO = getChainInfo(SupportedChainId.SOLANA)

export interface SolanaAlphaRiskModalProps {
  isDarkMode: boolean
  requiresAcknowledgement: boolean

  onAcknowledge(): void

  onGoBack(): void

  onClose(): void
}

export function SolanaAlphaRiskModal(props: SolanaAlphaRiskModalProps): ReactNode {
  const { isDarkMode, requiresAcknowledgement, onAcknowledge, onGoBack, onClose } = props

  return (
    <styledEl.Wrapper>
      <ModalHeader>
        <Trans>CoW Swap on Solana is in Alpha</Trans>
      </ModalHeader>
      <styledEl.Contents>
        <styledEl.NetworkBlock>
          <styledEl.NetworkLogo
            src={isDarkMode ? SOLANA_INFO.logo.dark : SOLANA_INFO.logo.light}
            alt={SOLANA_INFO.label}
          />
          <styledEl.NetworkLabel>{SOLANA_INFO.label}</styledEl.NetworkLabel>
          <Badge type={BadgeTypes.ALERT2}>
            <Trans>ALPHA</Trans>
          </Badge>
        </styledEl.NetworkBlock>
        <InlineBanner bannerType={StatusColorVariant.Alert} iconSize={24}>
          <p>
            <Trans>
              This is an Alpha version of CoW Swap on Solana. This deployment has not yet been independently audited and
              may contain bugs, vulnerabilities or unexpected behaviour that could result in failed transactions or
              partial or total loss of assets.
            </Trans>
          </p>
          <p>
            <Trans>Maximum trade size: ${SOLANA_ALPHA_MAX_TRADE_SIZE_USD_DISPLAY} per order.</Trans>
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
