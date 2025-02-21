import React from 'react'

import { COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS, COW_PROTOCOL_VAULT_RELAYER_ADDRESS } from '@cowprotocol/cow-sdk'
import { Color, Media } from '@cowprotocol/ui'

import { BlockExplorerLink } from 'components/common/BlockExplorerLink'
import LogoWrapper, { LOGO_MAP } from 'components/common/LogoWrapper'
import { useNetworkId } from 'state/network'
import styled from 'styled-components/macro'
import { Network } from 'types'

import { footerConfig } from './config'

const FooterStyled = styled.footer`
  display: flex;
  align-items: center;
  box-sizing: border-box;
  font-size: 1.2rem;
  flex: 1 1 auto;
  color: ${Color.explorer_textSecondary2};
  width: 100%;
  justify-content: space-around;
  margin: auto auto 0;
  height: auto;
  padding: 1rem;
  max-height: 4rem;

  ${Media.upToMedium()} {
    margin: 0 auto;
    flex-flow: column wrap;
    padding: 1.6rem 1.6rem 4rem;
    justify-content: flex-start;
    gap: 1.6rem;
    bottom: initial;
    max-height: initial;
  }

  > a {
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`

const BetaWrapper = styled.div`
  display: flex;
  margin: 0;
  height: 100%;
  align-items: center;
  padding: 0 1rem 0 0;
  position: relative;

  ${Media.upToMedium()} {
    margin: 0 0 1.6rem;
  }
`

const ContractsWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1.6rem;

  ${Media.upToMedium()} {
    flex-flow: column wrap;
  }

  > :nth-child(2) {
    margin-right: 1rem;

    ${Media.upToMedium()} {
      margin-right: 0;
    }
  }
`

const VerifiedButton = styled(BlockExplorerLink)`
  margin: 0;
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0;
  flex: 0 0 auto;
`

const ContractContainer = styled.div`
  display: flex;
  margin: 0 0 0 auto;
`

const VersionsWrapper = styled.div`
  display: flex;
  margin: 0 0 0 auto;
  align-items: center;

  ${Media.upToMedium()} {
    margin: 0 0 1.6rem;
  }

  > a {
    display: flex;
    align-items: center;
    &:not(:last-of-type) {
      margin: 0 1rem 0 0;
      position: relative;
    }
  }
`
export interface FooterType {
  readonly verifiedText?: string
  readonly isBeta?: boolean
  readonly url?: {
    readonly web: string
    readonly appId: string
    readonly contracts: {
      readonly repo: string
      readonly settlement: string
      readonly vaultRelayer: string
    }
  }
}

export const Footer: React.FC<FooterType> = (props) => {
  const { isBeta = footerConfig.isBeta, url = footerConfig.url } = props
  const networkId = useNetworkId() || Network.MAINNET
  const settlementContractAddress = COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[networkId]
  const vaultRelayerContractAddress = COW_PROTOCOL_VAULT_RELAYER_ADDRESS[networkId]

  return (
    <FooterStyled>
      {isBeta && <BetaWrapper>This project is in beta. Use at your own risk.</BetaWrapper>}
      <ContractsWrapper>
        {settlementContractAddress && (
          <ContractContainer>
            <VerifiedButton
              showLogo
              type="contract"
              identifier={settlementContractAddress}
              networkId={networkId}
              label="Settlement contract"
            />
            <a target="_blank" rel="noopener noreferrer" href={url.contracts.settlement}>
              <LogoWrapper className="github-logo" src={LOGO_MAP.github} title="Open it on Github" />
            </a>
          </ContractContainer>
        )}
        {vaultRelayerContractAddress && (
          <ContractContainer>
            <VerifiedButton
              showLogo
              type="contract"
              identifier={vaultRelayerContractAddress}
              networkId={networkId}
              label="Vault Relayer contract"
            />
            <a target="_blank" rel="noopener noreferrer" href={url.contracts.vaultRelayer}>
              <LogoWrapper className="github-logo" src={LOGO_MAP.github} title="Open it on Github" />
            </a>
          </ContractContainer>
        )}
      </ContractsWrapper>
      <VersionsWrapper>
        {url.web && VERSION && (
          <a target="_blank" rel="noopener noreferrer" href={url.web + VERSION}>
            Web: v{VERSION} <LogoWrapper className="github-logo" src={LOGO_MAP.github} title="Open it on Github" />
          </a>
        )}
      </VersionsWrapper>
    </FooterStyled>
  )
}
