import { useState, useEffect, ChangeEvent, JSX } from 'react'

import { Color, UI } from '@cowprotocol/ui'

import Image from 'next/image'
import { transparentize } from 'polished'
import styled from 'styled-components/macro'

import { Button } from '@/components/Button'
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
    background-color: var(${UI.COLOR_NEUTRAL_100});
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
  if (activeTab === 'Buy') {
    return {
      sellToken: NETWORK_DEFAULT_SELL_TOKEN_MAP[network],
      buyToken: contractAddress,
    }
  }

  return {
    sellToken: contractAddress,
    buyToken: NETWORK_DEFAULT_BUY_TOKEN_MAP[network],
  }
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

function DropdownNetworkOption({
  network,
  handleSelect,
}: {
  network: Network
  handleSelect: (network: Network) => void
}): JSX.Element {
  const width = 20
  const height = 20

  return (
    <DropdownOption onClick={() => handleSelect(network)}>
      <Image src={NETWORK_IMAGE_MAP[network]} alt={NETWORK_MAP[network]} width={width} height={height} />
      {NETWORK_MAP[network]}
    </DropdownOption>
  )
}

const getDropdownBody = (platforms: Platforms, handleSelect: (network: Network) => void): JSX.Element => {
  const { ethereum, xdai, base, 'arbitrum-one': arbitrum, avalanche, 'polygon-pos': polygon } = platforms

  return (
    <DropdownBody>
      {ethereum?.contractAddress && <DropdownNetworkOption network="ethereum" handleSelect={handleSelect} />}
      {base?.contractAddress && <DropdownNetworkOption network="base" handleSelect={handleSelect} />}
      {arbitrum?.contractAddress && <DropdownNetworkOption network="arbitrum-one" handleSelect={handleSelect} />}
      {polygon?.contractAddress && <DropdownNetworkOption network="polygon-pos" handleSelect={handleSelect} />}
      {avalanche?.contractAddress && <DropdownNetworkOption network="avalanche" handleSelect={handleSelect} />}
      {xdai?.contractAddress && <DropdownNetworkOption network="xdai" handleSelect={handleSelect} />}
    </DropdownBody>
  )
}

function getNetworkFromPlatforms(platforms: Platforms): Network {
  const { ethereum, xdai, base, 'arbitrum-one': arbitrum, avalanche, 'polygon-pos': polygon } = platforms

  if (ethereum?.contractAddress) return 'ethereum'
  if (base?.contractAddress) return 'base'
  if (arbitrum?.contractAddress) return 'arbitrum-one'
  if (polygon?.contractAddress) return 'polygon-pos'
  if (avalanche?.contractAddress) return 'avalanche'
  if (xdai?.contractAddress) return 'xdai'

  return 'ethereum'
}

export const SwapWidget = ({ tokenSymbol, tokenImage, platforms }: SwapWidgetProps): JSX.Element => {
  const [activeTab, setActiveTab] = useState<Tab>(DEFAULT_TAB)
  const [network, setNetwork] = useState<Network>(DEFAULT_NETWORK)
  const [amount, setAmount] = useState(0)

  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = (network: Network): void => {
    setNetwork(network)
    setIsOpen(false)
  }

  // set initial network based on the available platforms
  useEffect(() => {
    setNetwork(getNetworkFromPlatforms(platforms))
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

      <Button
        label={`Swap ${tokenSymbol}`}
        fontSize={1.6}
        minHeight={4.2}
        href={getSwapUrl()}
        target="_blank"
        rel="noopener noreferrer nofollow"
      />
    </Wrapper>
  )
}
