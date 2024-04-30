import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Color } from 'styles/variables'
import { Button } from '@/components/Button'
import { transparentize } from 'polished'
import { CONFIG } from '@/const/meta'
import { LinkWithUtm } from 'modules/utm'

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
  color: ${({ active }) => (active ? Color.darkBlue : transparentize(0.5, Color.darkBlue))};
  transition: color 0.2s ease-in-out, border-bottom 0.2s ease-in-out;
  border-bottom: ${({ active }) =>
    active ? `0.2rem solid ${Color.darkBlue}` : `0.1rem solid ${transparentize(0.8, Color.darkBlue)}`};
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

const Dropdown = styled.select`
  width: 100%;
  padding: 1rem;
  margin: 1rem 0;
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
  background: ${Color.grey};
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
  background-color: ${Color.grey};
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
    background-color: ${Color.white};
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

enum Networks {
  ETHEREUM = 'ethereum',
  XDAI = 'xdai',
}

const NETWORK_MAP: { [key: string]: string } = {
  [Networks.ETHEREUM]: 'Ethereum',
  [Networks.XDAI]: 'Gnosis Chain',
}

const WXDAI = '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d'
const WETH = ['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', '0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1']

export const SwapWidget = ({ tokenId, tokenSymbol, tokenImage, platforms }: SwapWidgetProps) => {
  const [activeTab, setActiveTab] = useState('Buy')
  const [network, setNetwork] = useState<string | null>(null)
  const [amount, setAmount] = useState(0)

  const [isOpen, setIsOpen] = useState(false)
  const handleSelect = (network) => {
    setNetwork(network)
    setIsOpen(false)
  }

  useEffect(() => {
    // set initial network based on the available platforms
    if (platforms.ethereum.contractAddress) setNetwork(Networks.ETHEREUM)
    else if (platforms.xdai.contractAddress) setNetwork(Networks.XDAI)
  }, [platforms])

  const handleInputChange = (event) => {
    let value = event.target.value

    // Remove leading minus sign if present
    if (value.startsWith('-')) {
      value = value.slice(1)
    }

    if (value === '' || (parseFloat(value) >= 0 && !isNaN(value))) {
      setAmount(value)
    }
  }

  const onSwap = () => {
    if (network && platforms[network]) {
      const networkId = network === 'xdai' ? 100 : 1
      const contractAddress = platforms[network].contractAddress

      let sellToken, buyToken
      if (activeTab === 'Buy') {
        sellToken = networkId === 100 ? 'WXDAI' : 'WETH'
        buyToken = contractAddress

        if (contractAddress === WXDAI) {
          sellToken = 'XDAI'
        }

        if (WETH.includes(contractAddress)) {
          sellToken = networkId === 100 ? 'WXDAI' : 'ETH'
        }
      } else {
        sellToken = contractAddress
        buyToken = networkId === 100 ? 'WXDAI' : 'WETH'

        if (contractAddress === WXDAI) {
          buyToken = 'XDAI'
        }

        if (WETH.includes(contractAddress)) {
          buyToken = networkId === 100 ? 'WXDAI' : 'ETH'
        }
      }

      const url = `https://swap.cow.fi/#/${networkId}/swap/${sellToken}/${buyToken}?${activeTab.toLowerCase()}Amount=${amount}`
      return url
    } else {
      return '#'
    }
  }

  return (
    <Wrapper>
      <TabContainer>
        <Tab onClick={() => setActiveTab('Buy')} active={activeTab === 'Buy'}>
          Buy
        </Tab>
        <Tab onClick={() => setActiveTab('Sell')} active={activeTab === 'Sell'}>
          Sell
        </Tab>
      </TabContainer>

      <DropdownContainer>
        <DropdownHeader onClick={() => setIsOpen(!isOpen)}>
          <img
            src={`/images/${network === Networks.ETHEREUM ? 'ethereum' : 'gnosis-chain'}.svg`}
            alt={NETWORK_MAP[network]}
          />
          <b>{NETWORK_MAP[network]}</b>
        </DropdownHeader>
        {isOpen && (
          <DropdownBody>
            {platforms?.ethereum?.contractAddress && (
              <DropdownOption onClick={() => handleSelect('ethereum')}>
                <img src="/images/ethereum.svg" alt="Ethereum" />
                Ethereum
              </DropdownOption>
            )}
            {platforms?.xdai?.contractAddress && (
              <DropdownOption onClick={() => handleSelect('xdai')}>
                <img src="/images/gnosis-chain.svg" alt="Gnosis Chain" />
                Gnosis Chain
              </DropdownOption>
            )}
          </DropdownBody>
        )}
      </DropdownContainer>

      <InputLabel>
        {activeTab === 'Buy' ? 'Receive' : 'Send'}

        <div>
          <TokenLabel>
            <img src={tokenImage} alt={tokenSymbol} />
            <span>{tokenSymbol}</span>
          </TokenLabel>
          <Input min={0} value={amount} type="text" onChange={handleInputChange} placeholder="0" />
        </div>
      </InputLabel>

      <LinkWithUtm
        defaultUtm={{
          ...CONFIG.utm,
          utmContent: 'utm_content=swap-widget-token__' + encodeURI(tokenId),
        }}
        href={onSwap()}
        passHref
      >
        <Button target="_blank" rel="noreferrer" label={`Swap ${tokenSymbol}`} fontSize={1.6} minHeight={4.2} />
      </LinkWithUtm>
    </Wrapper>
  )
}
