import { useState, useEffect, ChangeEvent, JSX } from 'react'

import { Color } from '@cowprotocol/ui'

import Image from 'next/image'
import { transparentize } from 'polished'
import styled from 'styled-components/macro'

import { LinkWithUtmComponent } from 'modules/utm/components'

import { Button } from '@/components/Button'
import { CONFIG } from '@/const/meta'
import {
  Network,
  NETWORK_DEFAULT_BUY_TOKEN_MAP,
  NETWORK_DEFAULT_SELL_TOKEN_MAP,
  NETWORK_ID_MAP,
  NETWORK_IMAGE_MAP,
  NETWORK_MAP,
} from '@/const/networkMap'

type TabProps = {
  active: boolean
}

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-flow: column wrap;
`

const Tab = styled.div<TabProps>`
  cursor: pointer;
  padding: 1.6rem 0;
  background: none;
  color: ${({ active }) => (active ? Color.cowfi_darkBlue : transparentize(0.5, Color.cowfi_darkBlue))};
  transition:
    color 0.2s ease-in-out,
    border-bottom 0.2s ease-in-out;
  border-bottom: ${({ active }) =>
    active ? `0.2rem solid ${Color.cowfi_darkBlue}` : `0.1rem solid ${transparentize(0.8, Color.cowfi_darkBlue)}`};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
`

const TabContainer = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  justify-content: space-between;
`

const Input = styled.input`
  width: 100%;
  padding: 1rem 0 1rem 1rem;
  font-size: 2rem;
  font-weight: 500;
  margin: 1rem 0;
  flex: 1;
  text-align: right;
  background: transparent;
  border: 0;
  outline: 0;
  -moz-appearance: textfield;
  appearance: textfield;

  &::placeholder {
    opacity: 0.5;
  }

  &:focus::placeholder {
    color: transparent;
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`

const InputLabel = styled.div`
  display: flex;
  flex-flow: column wrap;
  justify-content: space-between;
  border-radius: 0.8rem;
  background: ${Color.cowfi_grey};
  padding: 1.2rem;
  font-size: 1.4rem;
  margin: 0 0 1rem;

  > div {
    display: flex;
    flex-flow: row wrap;
  }
`

const TokenLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  > img {
    --size: 2.1rem;
    width: var(--size);
    height: var(--size);
    border-radius: var(--size);
  }

  > span {
    font-size: 2rem;
    font-weight: 600;
  }
`

const DropdownContainer = styled.div`
  position: relative;
  width: 100%;
  margin: 1.4rem 0;
`

const DropdownHeader = styled.div`
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.3rem;
  font-weight: 500;

  > img {
    --size: 1.6rem;
    width: var(--size);
    height: var(--size);
  }

  > b {
    display: flex;
    flex-flow: row wrap;
    gap: 0.3rem;
  }

  > b::after {
    --size: 1rem;
    content: '';
    width: var(--size);
    height: var(--size);
    display: inline-block;
    background: url(/images/icons/carret-down.svg) no-repeat center / contain;
  }
`

const DropdownBody = styled.div`
  position: absolute;
  top: calc(100% + 1rem);
  left: 0;
  width: 100%;
  background-color: ${Color.cowfi_grey};
  border-radius: 1.6rem;
  padding: 0.6rem;
  display: flex;
  flex-flow: column wrap;
  gap: 0.6rem;
`

const DropdownOption = styled.div`
  padding: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 1.3rem;
  font-weight: 500;

  &:hover {
    background-color: ${Color.neutral100};
    border-radius: 1rem;
  }

  > img {
    --size: 2rem;
    width: var(--size);
    height: var(--size);
    margin: 0 1rem 0 0;
  }
`

type PlatformData = {
  contractAddress: string
  decimalPlace: number
}

type Platforms = {
  [key: string]: PlatformData
}

type SwapWidgetProps = {
  tokenId: string
  tokenSymbol: string
  tokenImage: string
  platforms: Platforms
}

type Tab = 'Buy' | 'Sell'
const DEFAULT_TAB: Tab = 'Buy'
const DEFAULT_NETWORK: Network = 'ethereum'

const getBuyAndSellTokens = (
  activeTab: Tab,
  network: Network,
  contractAddress: string,
): { sellToken: string; buyToken: string } => {
  let sellToken, buyToken
  if (activeTab === 'Buy') {
    buyToken = contractAddress
    sellToken = NETWORK_DEFAULT_SELL_TOKEN_MAP[network]
  } else {
    sellToken = contractAddress
    buyToken = NETWORK_DEFAULT_BUY_TOKEN_MAP[network]
  }

  return { sellToken, buyToken }
}

const Tabs = ({ activeTab, setActiveTab }: { activeTab: Tab; setActiveTab: (tab: Tab) => void }): JSX.Element => {
  return (
    <TabContainer>
      <Tab onClick={() => setActiveTab('Buy')} active={activeTab === 'Buy'}>
        Buy
      </Tab>
      <Tab onClick={() => setActiveTab('Sell')} active={activeTab === 'Sell'}>
        Sell
      </Tab>
    </TabContainer>
  )
}

const getDropdownBody = (platforms: Platforms, handleSelect: (network: string) => void): JSX.Element => {
  const { ethereum, xdai, base, 'arbitrum-one': arbitrum, avalanche, 'polygon-pos': polygon } = platforms
  const width = 20
  const height = 20

  return (
    <DropdownBody>
      {ethereum?.contractAddress && (
        <DropdownOption onClick={() => handleSelect('ethereum')}>
          <Image src={NETWORK_IMAGE_MAP.ethereum} alt={NETWORK_MAP.ethereum} width={width} height={height} />
          {NETWORK_MAP.ethereum}
        </DropdownOption>
      )}
      {base?.contractAddress && (
        <DropdownOption onClick={() => handleSelect('base')}>
          <Image src={NETWORK_IMAGE_MAP.base} alt={NETWORK_MAP.base} width={width} height={height} />
          {NETWORK_MAP.base}
        </DropdownOption>
      )}
      {arbitrum?.contractAddress && (
        <DropdownOption onClick={() => handleSelect('arbitrum-one')}>
          <Image
            src={NETWORK_IMAGE_MAP['arbitrum-one']}
            alt={NETWORK_MAP['arbitrum-one']}
            width={width}
            height={height}
          />
          {NETWORK_MAP['arbitrum-one']}
        </DropdownOption>
      )}
      {polygon?.contractAddress && (
        <DropdownOption onClick={() => handleSelect('polygon-pos')}>
          <Image
            src={NETWORK_IMAGE_MAP['polygon-pos']}
            alt={NETWORK_MAP['polygon-pos']}
            width={width}
            height={height}
          />
          {NETWORK_MAP['polygon-pos']}
        </DropdownOption>
      )}
      {avalanche?.contractAddress && (
        <DropdownOption onClick={() => handleSelect('avalanche')}>
          <Image src={NETWORK_IMAGE_MAP.avalanche} alt={NETWORK_MAP.avalanche} width={width} height={height} />
          {NETWORK_MAP.avalanche}
        </DropdownOption>
      )}
      {xdai?.contractAddress && (
        <DropdownOption onClick={() => handleSelect('xdai')}>
          <Image src={NETWORK_IMAGE_MAP.xdai} alt={NETWORK_MAP.xdai} width={width} height={height} />
          {NETWORK_MAP.xdai}
        </DropdownOption>
      )}
    </DropdownBody>
  )
}

export const SwapWidget = ({ tokenId, tokenSymbol, tokenImage, platforms }: SwapWidgetProps): JSX.Element => {
  const [activeTab, setActiveTab] = useState<Tab>(DEFAULT_TAB)
  const [network, setNetwork] = useState<string>(DEFAULT_NETWORK)
  const [amount, setAmount] = useState(0)

  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = (network: string): void => {
    setNetwork(network)
    setIsOpen(false)
  }

  // set initial network based on the available platforms
  useEffect(() => {
    const { ethereum, xdai, base, 'arbitrum-one': arbitrum, avalanche, 'polygon-pos': polygon } = platforms

    if (ethereum?.contractAddress) setNetwork('ethereum')
    else if (base?.contractAddress) setNetwork('base')
    else if (arbitrum?.contractAddress) setNetwork('arbitrum-one')
    else if (polygon?.contractAddress) setNetwork('polygon-pos')
    else if (avalanche?.contractAddress) setNetwork('avalanche')
    else if (xdai?.contractAddress) setNetwork('xdai')
  }, [platforms])

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    let value = event.target.value

    // Remove leading minus sign if present
    if (value.startsWith('-')) {
      value = value.slice(1)
    }

    if (value === '' || (parseFloat(value) >= 0 && !isNaN(parseFloat(value)))) {
      setAmount(parseFloat(value))
    }
  }

  const getSwapUrl = (): string => {
    if (network && platforms[network]) {
      const networkId = NETWORK_ID_MAP[network as Network]
      const contractAddress = platforms[network].contractAddress

      const { sellToken, buyToken } = getBuyAndSellTokens(activeTab, network as Network, contractAddress)

      return `https://swap.cow.fi/#/${networkId}/swap/${sellToken}/${buyToken}?${activeTab.toLowerCase()}Amount=${amount}`
    } else {
      return '#'
    }
  }

  const networkImage = NETWORK_IMAGE_MAP[network as Network]
  const networkName = NETWORK_MAP[network as Network]

  return (
    <Wrapper>
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <DropdownContainer>
        <DropdownHeader onClick={() => setIsOpen(!isOpen)}>
          <Image src={networkImage} alt={networkName} width={16} height={16} />
          <b>{networkName}</b>
        </DropdownHeader>
        {isOpen && getDropdownBody(platforms, handleSelect)}
      </DropdownContainer>

      <InputLabel>
        {activeTab === 'Buy' ? 'Receive' : 'Send'}

        <div>
          <TokenLabel>
            <Image src={tokenImage} alt={tokenSymbol} width={20} height={20} />
            <span>{tokenSymbol}</span>
          </TokenLabel>
          <Input min={0} value={amount} type="text" onChange={handleInputChange} placeholder="0" />
        </div>
      </InputLabel>

      <LinkWithUtmComponent
        defaultUtm={{
          ...CONFIG.utm,
          utmContent: 'utm_content=swap-widget-token__' + encodeURI(tokenId),
        }}
        href={getSwapUrl()}
        passHref
      >
        <Button label={`Swap ${tokenSymbol}`} fontSize={1.6} minHeight={4.2} />
      </LinkWithUtmComponent>
    </Wrapper>
  )
}
