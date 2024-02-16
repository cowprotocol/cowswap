import { Command } from '@cowprotocol/types'
import { AutoRow } from '@cowprotocol/ui'
import { Connector } from '@web3-react/types'

import { Trans } from '@lingui/macro'

import { LightCard } from 'legacy/components/Card'
import { AutoColumn } from 'legacy/components/Column'
import { ThemedText } from 'legacy/theme'
import { StyledInternalLink } from 'legacy/theme/components'

import { Routes } from 'common/constants/routes'
import { CloseIcon, ContentWrapper, CowModal, HeaderRow, HoverText } from 'common/pure/Modal'

import { CloseColor, OptionGrid, TermsWrapper, UpperSection, Wrapper } from './styled'

import { ConnectWalletOptions, TryActivation } from '../../containers/ConnectWalletOptions'
import { PendingView } from '../PendingView'

export type WalletModalView = 'options' | 'account' | 'pending'

interface WalletModalProps {
  isOpen: boolean
  toggleModal: Command
  view: WalletModalView
  openOptions: Command
  tryConnection: Command
  pendingError: string | undefined

  // TODO: Remove dependency web3-react
  pendingConnector: Connector | undefined
  tryActivation: TryActivation
  account: string | undefined
}

export function WalletModal(props: WalletModalProps) {
  const { isOpen, toggleModal, view, openOptions, pendingError, tryActivation, tryConnection, pendingConnector } = props

  const isPending = view === 'pending'

  return (
    <CowModal maxWidth={600} isOpen={isOpen} onDismiss={toggleModal} minHeight={false} maxHeight={90}>
      <Wrapper>
        <UpperSection>
          <CloseIcon onClick={toggleModal}>
            <CloseColor />
          </CloseIcon>
          {!isPending && (
            <HeaderRow>
              <HoverText>
                <Trans>Connect a wallet</Trans>
              </HoverText>
            </HeaderRow>
          )}
          <ContentWrapper>
            <AutoColumn gap="16px">
              {isPending && pendingConnector && (
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
