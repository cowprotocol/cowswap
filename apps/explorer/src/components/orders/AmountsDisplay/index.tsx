import React from 'react'

import { isSellOrder } from '@cowprotocol/common-utils'

import { TokenErc20 } from '@gnosis.pm/dex-js'
import BigNumber from 'bignumber.js'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import { TokenDisplay } from 'components/common/TokenDisplay'
import { useNetworkId } from 'state/network'
import { Network } from 'types'
import { formatSmartMaxPrecision, isNativeToken } from 'utils'


import { Order } from 'api/operator'


import { RowContents, RowTitle, Wrapper } from './styled'


type RowProps = {
  title: string
  titleSuffix?: string
  amount: BigNumber
  erc20: TokenErc20
  network: Network
}

function Row(props: RowProps): JSX.Element {
  const { title, titleSuffix, amount, erc20, network } = props

  // TODO: calculate real usd amount
  // const usdAmount = '31231.32'

  // Decimals are optional on ERC20 spec. In that unlikely case, graceful fallback to raw amount
  const formattedAmount = erc20.decimals >= 0 ? formatSmartMaxPrecision(amount, erc20) : amount.toString(10)
  const tokenDisplay = <TokenDisplay erc20={erc20} network={network} />
  return (
    <>
      <RowTitle>
        {title} {titleSuffix && titleSuffix}
      </RowTitle>
      <RowContents>
        <span>{formattedAmount}</span>
        {/* <UsdAmount>(~${usdAmount})</UsdAmount> */}
        {isNativeToken(erc20.address) ? (
          tokenDisplay
        ) : (
          <RowWithCopyButton textToCopy={erc20.address} contentsToDisplay={tokenDisplay} />
        )}
      </RowContents>
    </>
  )
}

export type Props = { order: Order }

export function AmountsDisplay(props: Props): JSX.Element | null {
  const { order } = props
  const { kind, buyAmount, buyToken, sellAmount, feeAmount, sellToken } = order
  const network = useNetworkId()

  if (!buyToken || !sellToken || !network) {
    return null
  }

  const isSell = isSellOrder(kind)

  return (
    <Wrapper>
      <Row
        title="From"
        titleSuffix={isSell ? '' : 'at most'}
        amount={sellAmount.plus(feeAmount)}
        erc20={sellToken}
        network={network}
      />
      <Row title="To" titleSuffix={isSell ? 'at least' : ''} amount={buyAmount} erc20={buyToken} network={network} />
    </Wrapper>
  )
}
