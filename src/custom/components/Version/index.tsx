import React from 'react'
import styled from 'styled-components'
import { useActiveWeb3React } from 'hooks'
import { ExternalLink, TYPE } from 'theme'
import { GP_SETTLEMENT_CONTRACT_ADDRESS } from 'custom/constants'
import { getEtherscanLink } from 'utils'

import { version as WEB } from '@src/../package.json'
import { version as CONTRACTS } from '@gnosis.pm/gp-v2-contracts/package.json'

const VERSIONS = {
  WEB,
  CONTRACTS
}

const versionsList = Object.entries(VERSIONS)

const StyledPolling = styled.div`
  position: fixed;
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-start;

  left: 0;
  bottom: 0;

  padding: 1rem;

  color: ${({ theme }) => theme.green1};
  opacity: 0.4;

  &:hover {
    opacity: 1;
  }

  transition: opacity 0.25s ease;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: none;
  `}
`

const VersionsExternalLink = styled(ExternalLink)<{ isUnclickable?: boolean }>`
  ${({ isUnclickable = false }): string | false =>
    isUnclickable &&
    `
      pointer-events: none;
      curose: none;
  `}
`

const VersionData = ({ versions }: { versions: typeof versionsList }) => (
  <StyledPolling>
    {versions.map(([key, val]) => (
      <TYPE.small key={key}>
        {key}: <strong>{val}</strong>
      </TYPE.small>
    ))}
  </StyledPolling>
)

const Version = () => {
  const { chainId } = useActiveWeb3React()
  const swapAddress = chainId ? GP_SETTLEMENT_CONTRACT_ADDRESS[chainId] : null

  return (
    <VersionsExternalLink
      isUnclickable={!chainId || !swapAddress}
      href={chainId && swapAddress ? getEtherscanLink(chainId, swapAddress, 'address') : ''}
    >
      <VersionData versions={versionsList} />
    </VersionsExternalLink>
  )
}

export default Version
