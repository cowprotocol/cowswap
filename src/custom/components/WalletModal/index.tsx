import React from 'react'
import Modal from '@src/components/Modal'
import styled from 'styled-components'
import WalletModalMod, { WalletModalProps } from './WalletModalMod'
import { ExternalLink } from 'theme'
import { Trans } from '@lingui/macro'

export * from '@src/components/WalletModal'

export const GpModal = styled(Modal)`
  > [data-reach-dialog-content] {
    background-color: ${({ theme }) => theme.bg1};
  }
`

const TermsWrapper = styled.div`
  color: ${({ theme }) => theme.text1};
`

function CustomTerms() {
  return (
    <TermsWrapper>
      <Trans>
        By connecting a wallet, you agree to GnosisDAO&apos;s{' '}
        <ExternalLink href="#/terms-and-conditions">Terms &amp; Conditions</ExternalLink> and acknowledge that you have
        read, understood, and agree to them.{' '}
      </Trans>
    </TermsWrapper>
  )
}

const Blurb = styled.div`
  width: 100%;
  margin: 16px 0 0;
  text-align: center;
  font-size: smaller;
  line-height: 1.5;
`

const NewToEthereum = () => (
  <Blurb>
    <div>New to decentralised applications?</div>{' '}
    <ExternalLink href="https://ethereum.org/wallets/">Learn more about wallets</ExternalLink>
  </Blurb>
)

export default function WalletModal(props: Omit<WalletModalProps, 'Modal' | 'NewToEthereum' | 'CustomTerms'>) {
  return <WalletModalMod {...props} Modal={GpModal} NewToEthereum={NewToEthereum} CustomTerms={CustomTerms} />
}
