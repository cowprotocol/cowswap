import styled from 'styled-components/macro'
import { ExternalLink } from 'theme'

import pkg from '@src/../package.json'
import contractsPkg from '@cowprotocol/contracts/package.json'
import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { getEtherscanLink } from 'utils'
import { CODE_LINK, GP_VAULT_RELAYER, GP_SETTLEMENT_CONTRACT_ADDRESS } from 'constants/index'
import { DEFAULT_NETWORK_FOR_LISTS } from 'constants/lists'
import { useWalletInfo } from '@cow/modules/wallet'

function _getContractsUrls(chainId: ChainId, contractAddressMap: typeof GP_SETTLEMENT_CONTRACT_ADDRESS) {
  const contractAddress = contractAddressMap[chainId]
  if (!contractAddress) return '-'
  return getEtherscanLink(chainId, contractAddress, 'address')
}

const VERSIONS: Record<
  string,
  {
    version: string
    href: (chainId: ChainId) => string
    // | { github: string; etherscan: string }
  }
> = {
  Web: {
    version: 'v' + pkg.version,
    href() {
      return CODE_LINK
    },
  },
  'Vault Relayer': {
    version: 'v' + contractsPkg.version,
    href(chainId: ChainId) {
      // return Etherscan by default
      return _getContractsUrls(chainId, GP_VAULT_RELAYER)

      // return {
      //   etherscan: _getContractsUrls(chainId, GP_VAULT_RELAYER),
      //   github: `https://github.com/cowprotocol/contracts/blob/v${CONTRACTS_VERSION}/src/contracts/GPv2VaultRelayer.sol`,
      // }
    },
  },
  'Settlement Contract': {
    version: 'v' + contractsPkg.version,
    href(chainId: ChainId) {
      // return Etherscan by default
      return _getContractsUrls(chainId, GP_SETTLEMENT_CONTRACT_ADDRESS)

      // return {
      //   etherscan: _getContractsUrls(chainId, GP_SETTLEMENT_CONTRACT_ADDRESS),
      //   github: `https://github.com/cowprotocol/contracts/blob/v${CONTRACTS_VERSION}/src/contracts/GPv2Settlement.sol`,
      // }
    },
  },
}

const versionsList = Object.keys(VERSIONS)

const StyledPolling = styled.div`
  position: relative;
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-start;
  padding: 16px 0;
  color: ${({ theme }) => theme.text1};
  gap: 10px;
`

const VersionsExternalLink = styled(ExternalLink)<{ isUnclickable?: boolean }>`
  color: inherit;

  > span {
    display: inline-block;
    transform: rotate(0);
    transition: transform 0.3s ease-in-out;
  }

  &:hover > span {
    transform: rotate(404deg);
  }

  ${({ isUnclickable = false }): string | false =>
    isUnclickable &&
    `
      pointer-events: none;
      cursor: none;
  `}
`

const VersionsLinkWrapper = styled.span`
  font-size: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0.5;
  transition: opacity 0.3s ease-in-out;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    opacity: 1;
    font-size: 13px;
    width: 100%;
  `}

  &:hover {
    opacity: 1;
  }
`

export const Version = ({ className }: { className?: string }) => {
  const { chainId = DEFAULT_NETWORK_FOR_LISTS } = useWalletInfo()
  return (
    <StyledPolling className={className}>
      {/* it's hardcoded anyways */}
      {versionsList.map((key) => {
        const { href, version } = VERSIONS[key]
        const chainHref = href(chainId)

        return (
          <VersionsLinkWrapper key={key}>
            {typeof chainHref == 'string' && (
              <VersionsExternalLink href={chainHref}>
                {key} {version} <span>↗</span>
              </VersionsExternalLink>
            )}
          </VersionsLinkWrapper>
        )
      })}
    </StyledPolling>
  )
}
