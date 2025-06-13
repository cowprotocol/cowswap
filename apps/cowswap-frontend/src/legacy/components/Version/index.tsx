import { useState, useRef } from 'react'

import ICON_ARROW_DOWN from '@cowprotocol/assets/images/carret-down.svg'
import ICON_X from '@cowprotocol/assets/images/x.svg'
import { CODE_LINK } from '@cowprotocol/common-const'
import { useOnClickOutside } from '@cowprotocol/common-hooks'
import { getEtherscanLink } from '@cowprotocol/common-utils'
import contractsPkg from '@cowprotocol/contracts/package.json'
import {
  COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS,
  COW_PROTOCOL_VAULT_RELAYER_ADDRESS,
  SupportedChainId as ChainId,
} from '@cowprotocol/cow-sdk'
import { UI, ExternalLink, Media } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

import pkg from '../../../../package.json'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const _getContractsUrls = (chainId: ChainId, contractAddressMap: typeof COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS) => {
  const contractAddress = contractAddressMap[chainId]
  return contractAddress ? getEtherscanLink(chainId, 'address', contractAddress) : '-'
}

type VersionInfo = {
  version: string
  href: (_chainId: ChainId) => string
}

const VERSIONS: Record<string, VersionInfo> = {
  Web: {
    version: 'v' + pkg.version,
    href: () => CODE_LINK,
  },
  'Vault Relayer': {
    version: 'v' + contractsPkg.version,
    href: (chainId: ChainId) => _getContractsUrls(chainId, COW_PROTOCOL_VAULT_RELAYER_ADDRESS),
  },
  'Settlement Contract': {
    version: 'v' + contractsPkg.version,
    href: (chainId: ChainId) => _getContractsUrls(chainId, COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS),
  },
}

const versionsList = Object.keys(VERSIONS)

const Dropdown = styled.div`
  position: relative;
  display: inline-block;
`

const DropdownContent = styled.div`
  display: block;
  position: absolute;
  background-color: var(${UI.COLOR_PAPER});
  min-width: 160px;
  box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2);
  padding: 12px 16px;
  bottom: 100%;
  right: 0;
  height: min-content;
  z-index: 999;
  width: max-content;
  border-radius: 16px;
  margin: auto auto 12px;

  ${Media.upToLarge()} {
    left: 0;
    right: initial;
  }

  ${Media.upToMedium()} {
    width: 100%;
    position: fixed;
    bottom: 56px;
    margin: 0;
    padding: 18px 24px;
    box-shadow: 0 -100vh 0 100vh rgb(0 0 0 / 40%);
    border-bottom: 1px solid var(${UI.COLOR_BORDER});
    border-radius: 16px 16px 0 0;
  }
`

const DropdownButton = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 4px;
  border-radius: 16px;

  &:hover {
    > svg {
      transform: rotate(-90deg);
    }
  }

  > svg {
    --size: 12px;
    color: inherit;
    width: var(--size);
    height: var(--size);
    transition: transform 0.2s ease-in-out;
  }
`

const VersionLink = styled(ExternalLink)<{ onClick: () => void }>`
  display: block;
  margin: 5px 0;

  ${Media.upToMedium()} {
    margin: 24px 0;
    font-size: 16px;
  }

  span {
    font-size: 12px;
    color: var(${UI.COLOR_INFO_TEXT});
    background: var(${UI.COLOR_INFO_BG});
    border-radius: 8px;
    padding: 2px 4px;
  }
`

const CloseButton = styled.span`
  position: absolute;
  top: 4px;
  right: 10px;
  cursor: pointer;
  font-size: 16px;
  color: var(${UI.COLOR_TEXT_OPACITY_50});
  transition: color 0.2s ease-in-out;

  ${Media.upToMedium()} {
    top: 16px;
    right: 16px;
  }

  &:hover {
    color: var(${UI.COLOR_TEXT});
  }

  > svg {
    --size: 8px;
    width: var(--size);
    height: var(--size);

    ${Media.upToMedium()} {
      --size: 16px;
    }
  }
`

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const Version = ({ className }: { className?: string }) => {
  const { chainId } = useWalletInfo()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const webVersion = VERSIONS['Web'].version

  useOnClickOutside([dropdownRef], () => setShowDropdown(false))

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleLinkClick = () => {
    setShowDropdown(false)
  }

  return (
    <Dropdown className={className} ref={dropdownRef}>
      <DropdownButton onClick={() => setShowDropdown(!showDropdown)}>
        {webVersion} <SVG src={ICON_ARROW_DOWN} />
      </DropdownButton>
      {showDropdown && (
        <DropdownContent>
          <CloseButton onClick={() => setShowDropdown(false)}>
            <SVG src={ICON_X} />
          </CloseButton>
          {versionsList.map((key) => {
            const { href, version } = VERSIONS[key]
            const chainHref = href(chainId)
            return (
              <VersionLink key={key} href={chainHref} onClick={handleLinkClick}>
                {key} <span>{version}</span>
              </VersionLink>
            )
          })}
        </DropdownContent>
      )}
    </Dropdown>
  )
}
