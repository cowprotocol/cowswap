import { Command } from '@cowprotocol/types'
import { AutoRow } from '@cowprotocol/ui'
import { TryActivation } from '@cowprotocol/wallet'

import { Trans } from '@lingui/macro'
import { ThemedText } from 'theme'
import { StyledInternalLink } from 'theme'

import { LightCard } from 'legacy/components/Card'
import { AutoColumn } from 'legacy/components/Column'

import { Routes } from 'common/constants/routes'
import { CloseIcon, ContentWrapper, CowModal, HeaderRow, HoverText } from 'common/pure/Modal'

import { CloseColor, OptionGrid, TermsWrapper, UpperSection, Wrapper } from './styled'

import { ConnectWalletOptions } from '../../containers/ConnectWalletOptions'
import { PendingView } from '../PendingView'

export type WalletModalView = 'options' | 'account' | 'pending'

interface WalletModalProps {
  isOpen: boolean
  onDismiss: Command
  view: WalletModalView
  openOptions: Command
  tryConnection: Command
  pendingError: string | undefined
  tryActivation: TryActivation
  account: string | undefined
}

export function WalletModal(props: WalletModalProps) {
  const { isOpen, onDismiss, view, openOptions, pendingError, tryActivation, tryConnection } = props

  const isPending = view === 'pending'

  return (
    <CowModal maxWidth={600} isOpen={isOpen} onDismiss={onDismiss} minHeight={false} maxHeight={90}>
      <Wrapper>
        <UpperSection>
          {!isPending && (
            <HeaderRow>
              <HoverText>
                <Trans>Connect a wallet</Trans>
              </HoverText>

              <CloseIcon onClick={onDismiss}>
                <CloseColor />
              </CloseIcon>
            </HeaderRow>
          )}
          <ContentWrapper>
            <AutoColumn gap="16px">
              {isPending && (
                <PendingView openOptions={openOptions} error={pendingError} tryConnection={tryConnection} />
              )}
              {!isPending && (
                <OptionGrid data-testid="option-grid">
                  <ConnectWalletOptions tryActivation={tryActivation} />
                </OptionGrid>
              )}
              {!pendingError && (
                <LightCard>
                  <AutoRow style={{ flexWrap: 'nowrap' }}>
                    <ThemedText.Body fontSize={12}>
                      <CustomTerms />
                    </ThemedText.Body>
                  </AutoRow>
                </LightCard>
              )}
            </AutoColumn>
          </ContentWrapper>
        </UpperSection>
      </Wrapper>
    </CowModal>
  )
}

function CustomTerms() {
  return (
    <TermsWrapper>
      <Trans>
        By connecting a wallet, you acknowledge that you have read, understood and agree to the interface’s{' '}
        <StyledInternalLink style={{ marginRight: 5 }} to={Routes.TERMS_CONDITIONS} target="_blank">
          Terms &amp; Conditions.
        </StyledInternalLink>
      </Trans>
    </TermsWrapper>
  )
}
