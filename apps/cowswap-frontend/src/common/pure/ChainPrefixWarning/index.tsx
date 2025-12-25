import { BaseChainInfo } from '@cowprotocol/common-const'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { WarningCard } from '../WarningCard'

const Wrapper = styled(WarningCard)`
  p {
    margin-block-start: 0.3em;
    margin-block-end: 0.3em;
  }
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
export default function ChainPrefixWarning({ chainPrefixWarning, chainInfo }: ChainPrefixWarningProps) {
  const { label, addressPrefix } = chainInfo
  return (
    <Wrapper>
      <p>
        <Trans>
          The recipient address you inputted had the chain prefix <strong>{chainPrefixWarning}</strong>, which is not
          the expected for the output token's network.
        </Trans>
      </p>
      <p>
        <Trans>
          Please, make sure your address follows the format <Format>{addressPrefix}:&lt;your-address&gt;</Format> or
          double-check if it is compatible with <strong>{label}</strong> network.
        </Trans>
      </p>
    </Wrapper>
  )
}
