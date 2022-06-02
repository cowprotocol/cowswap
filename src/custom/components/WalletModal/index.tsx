import { GpModal } from 'components/Modal' // mod
import styled from 'styled-components/macro'
import WalletModalMod, { WalletModalProps } from './WalletModalMod'
import { ExternalLink } from 'theme'
import { Trans } from '@lingui/macro'
import { Routes } from 'constants/routes'

// export * from '@src/components/WalletModal'

const TermsWrapper = styled.div`
  color: ${({ theme }) => theme.text1};
`

function CustomTerms() {
  return (
    <TermsWrapper>
      <Trans>
        By connecting a wallet, you agree to GnosisDAO&apos;s{' '}
        <ExternalLink href={Routes.TERMS_CONDITIONS}>Terms &amp; Conditions</ExternalLink> and acknowledge that you have
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
