import { BaseChainInfo } from '@cowprotocol/common-const'

import { WarningCard } from '../WarningCard'
import styled from 'styled-components/macro'

const Wrapper = styled(WarningCard)`
  p {
    margin-block-start: 0.3em;
    margin-block-end: 0.3em;
  }
`

const NetworkImg = styled.img`
  width: 15px;
  height: 15px;
`

const Label = styled.span<{ color: string }>`
  display: inline-block;
  background-color: white;
  border: 2px ${({ color }) => color} solid;
  padding: 4px 4px;
  margin: 0 0 0 0.5em;
  border-radius: 1rem;
`

const Format = styled.strong`
  font-family: monospace;
  color: ${({ theme }) => theme.text3};

  white-space: nowrap;
`

type ChainPrefixWarningProps = {
  chainPrefixWarning: string
  chainInfo: BaseChainInfo
}
export default function ChainPrefixWarning({ chainPrefixWarning, chainInfo }: ChainPrefixWarningProps) {
  const { label, addressPrefix, logoUrl, color } = chainInfo
  return (
    <Wrapper>
      <p>
        The recipient address you inputted had the chain prefix <strong>{chainPrefixWarning}</strong>, which is not not
        the expected for the network you are in.
      </p>
      <p>
        You are connected to
        <Label color={color}>
          <NetworkImg src={logoUrl} /> {label}
        </Label>
      </p>
      <p>
        Please, make sure your address follows the format <Format>{addressPrefix}:&lt;your-address&gt;</Format> or
        double-check if it is compatible with <strong>{label}</strong> network.
      </p>
    </Wrapper>
  )
}
