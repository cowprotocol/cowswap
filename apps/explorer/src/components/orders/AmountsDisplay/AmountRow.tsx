import React, { useMemo } from 'react'

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
}

export function AmountRow(props: AmountRowProps): React.ReactNode {
  const { title, titleSuffix, amount, erc20, network } = props

  const { formattedAmount, isNative } = useMemo(() => formatTokenAmount(amount, erc20), [amount, erc20])

  const tokenDisplay = useMemo(
    () => <TokenDisplay erc20={erc20} network={network} showNetworkName={true} />,
    [erc20, network],
  )

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
