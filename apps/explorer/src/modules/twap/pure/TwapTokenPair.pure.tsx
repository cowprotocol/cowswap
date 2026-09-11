import type { ReactNode } from 'react'

import { shortenAddress } from '@cowprotocol/common-utils'
import { getAddressKey } from '@cowprotocol/cow-sdk'
import { Color } from '@cowprotocol/ui'

import { BlockExplorerLink } from 'components/common/BlockExplorerLink'
import { TokenDisplay } from 'components/common/TokenDisplay'
import styled from 'styled-components/macro'

import type { TokenErc20 } from '@gnosis.pm/dex-js'

const Pair = styled.span`
  display: flex;
  align-items: center;
  gap: 0.8rem;

  a {
    color: ${Color.explorer_textActive};
  }
`

interface TwapTokenPairProps {
  sellTokenAddress: string
  buyTokenAddress: string
  sellToken?: TokenErc20 | null
  buyToken?: TokenErc20 | null
  chainId: number
}

export function TwapTokenPair({
  sellTokenAddress,
  buyTokenAddress,
  sellToken,
  buyToken,
  chainId,
}: TwapTokenPairProps): ReactNode {
  return (
    <Pair>
      <TwapToken address={sellTokenAddress} token={sellToken} chainId={chainId} />
      <span>→</span>
      <TwapToken address={buyTokenAddress} token={buyToken} chainId={chainId} />
    </Pair>
  )
}

function TwapToken({
  address,
  token,
  chainId,
}: {
  address: string
  token?: TokenErc20 | null
  chainId: number
}): ReactNode {
  if (token) return <TokenDisplay erc20={token} network={chainId} showAbbreviated />

  const addressKey = getAddressKey(address)
  return (
    <BlockExplorerLink
      type="token"
      identifier={addressKey}
      networkId={chainId}
      label={`${shortenAddress(addressKey)}↗`}
    />
  )
}
