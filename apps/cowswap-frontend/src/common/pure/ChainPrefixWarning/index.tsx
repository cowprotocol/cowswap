import { BaseChainInfo } from '@cowprotocol/common-const'

import styled from 'styled-components/macro'

import { WarningCard } from '../WarningCard'

const Wrapper = styled(WarningCard)`
  p {
    margin-block-start: 0.3em;
    margin-block-end: 0.3em;
  }
`

const NetworkImg = styled.img`
  width: 15px;
  height: 15px;
  margin-right: 0.5em;
`

const Label = styled.span<{ color: string }>`
  display: inline-flex;
  background-color: white;
  border: 2px ${({ color }) => color} solid;
  padding: 4px 4px;
  margin: 0 0 0 0.5em;
  border-radius: 8px;
`

const Format = styled.strong`
  font-family: monospace;
  color: ${({ theme }) => theme.info};

  white-space: nowrap;
`

type ChainPrefixWarningProps = {
  chainPrefixWarning: string
  chainInfo: BaseChainInfo
  isDarkMode: boolean
}
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function ChainPrefixWarning({ chainPrefixWarning, chainInfo, isDarkMode }: ChainPrefixWarningProps) {
  const { label, addressPrefix, logo, color } = chainInfo
  const logoUrl = isDarkMode ? logo.dark : logo.light
  return (
    <Wrapper>
      <p>
        The recipient address you inputted had the chain prefix <strong>{chainPrefixWarning}</strong>, which is not the
        expected for the network you are in.
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
