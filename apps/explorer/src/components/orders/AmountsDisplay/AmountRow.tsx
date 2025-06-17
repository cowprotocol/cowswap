import React from 'react'

import { TokenErc20 } from '@gnosis.pm/dex-js'
import BigNumber from 'bignumber.js'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import { TokenDisplay } from 'components/common/TokenDisplay'
import { Network } from 'types'

import { formatTokenAmount } from 'utils/tokenFormatting'

import { RowContents, RowTitle } from './styled'

interface AmountRowProps {
  title: string
  titleSuffix?: string
  amount: BigNumber
  erc20: TokenErc20
  network: Network
  isBridging: boolean
}

export function AmountRow(props: AmountRowProps): React.ReactNode {
  const { title, titleSuffix, amount, erc20, network, isBridging } = props

  const { formattedAmount, isNative } = formatTokenAmount(amount, erc20)

  const tokenDisplay = <TokenDisplay erc20={erc20} network={network} showNetworkName={isBridging} />

  return (
    <>
      <RowTitle>
        {title} {titleSuffix && titleSuffix}
      </RowTitle>
      <RowContents>
        <span>{formattedAmount}</span>
        {isNative ? tokenDisplay : <RowWithCopyButton textToCopy={erc20.address} contentsToDisplay={tokenDisplay} />}
      </RowContents>
    </>
  )
}
