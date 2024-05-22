import { BaseChainInfo } from '@cowprotocol/common-const'

import { WarningCard } from '../WarningCard'
import styled from 'styled-components/macro'

const NetworkImg = styled.img`
  width: 12px;
  height: 12px;
`

const Label = styled.span<{ color: string }>`
  display: inline-block;
  background-color: white;
  border: 2px ${({ color }) => color} solid;
  padding: 4px 4px;
  margin: 0 0 0 0.5em;
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
    <WarningCard>
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
        Please, make sure your address follows the format <Format>{addressPrefix}:&lt;your-address&gt;</Format> or make
        sure it is compatible with <strong>{label}</strong> network.
      </p>
    </WarningCard>
  )
}
