import { GpModal } from 'common/pure/Modal'

import { Trans } from '@lingui/macro'
import { Routes } from 'constants/routes'
import { StyledInternalLink } from 'theme/components'

import { Connector } from '@web3-react/types'

import { AutoColumn } from 'components/Column'
import { AutoRow } from 'components/Row'

import { ThemedText } from 'theme'
import { LightCard } from 'components/Card'

import { HeaderRow, HoverText, CloseIcon, ContentWrapper } from 'common/pure/Modal'
import { CloseColor, OptionGrid, TermsWrapper, UpperSection, Wrapper } from './styled'
import { PendingView } from 'modules/wallet/api/pure/PendingView'
import { ConnectWalletOptions, TryActivation } from 'modules/wallet/web3-react/connection'
import { ZengoBanner } from 'modules/wallet/api/pure/ZengoBanner'

export type WalletModalView = 'options' | 'account' | 'pending'

interface WalletModalProps {
  isOpen: boolean
  toggleModal: () => void
  view: WalletModalView
  openOptions: () => void
  tryConnection: () => void // () => tryActivation(connector)
  pendingError: string | undefined

  // TODO: Remove dependency web3-react
  pendingConnector: Connector | undefined
  tryActivation: TryActivation
  account: string | undefined
}

export function WalletModal(props: WalletModalProps) {
  const {
    isOpen,
    toggleModal,
    view,
    openOptions,
    pendingError,
    tryActivation,
    tryConnection,
    pendingConnector,
    account,
  } = props

  const isPending = view === 'pending'
  const isOptions = view === 'options'
  const showZengoBanner = !account && !window.ethereum && isOptions

  return (
    <GpModal maxWidth={600} isOpen={isOpen} onDismiss={toggleModal} minHeight={false} maxHeight={90}>
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
                <PendingView openOptions={openOptions} error={!!pendingError} tryConnection={tryConnection} />
              )}
              {!isPending && (
                <OptionGrid data-testid="option-grid">
                  <ConnectWalletOptions tryActivation={tryActivation} />
                </OptionGrid>
              )}
              {showZengoBanner && <ZengoBanner />}
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
    </GpModal>
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
