import { ReactNode } from 'react'

import { Percent } from '@cowprotocol/currency'
import { useWalletDetails } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Nullish } from 'types'

import { AffiliateTraderRewardsRow, useIsRewardsRowEnabled } from 'modules/affiliate'
import { ReceiveAmountInfo } from 'modules/trade'
import { TradeBasicConfirmDetails } from 'modules/trade/containers/TradeBasicConfirmDetails'
import { DividerHorizontal } from 'modules/trade/pure/Row/styled'

import { RateInfoParams } from 'common/pure/RateInfo'
import { NetworkCostsSuffix } from 'common/pure/NetworkCostsSuffix'

import { TwapConfirmDetails } from './TwapConfirmDetails'

const getConfirmModalConfig = (): {
  priceLabel: string
  slippageLabel: string
  slippageTooltip: ReactNode
  limitPriceLabel: string
  limitPriceTooltip: ReactNode
  minReceivedLabel: string
  minReceivedTooltip: string
} => ({
  priceLabel: t`Rate`,
  slippageLabel: t`Price protection`,
  slippageTooltip: (
    <>
      <p>
        <Trans>
          Since TWAP orders consist of multiple parts, prices are expected to fluctuate. However, to protect you against
          bad prices, CoW Swap will not execute your TWAP if the price dips below this percentage.
        </Trans>
      </p>
      <p>
        <Trans>
          This percentage only applies to dips; if prices are better than this percentage, CoW Swap will still execute
          your order.
        </Trans>
      </p>
    </>
  ),
  limitPriceLabel: t`Limit price (incl. fees)`,
  limitPriceTooltip: (
    <Trans>
      If CoW Swap cannot get this price or better (taking into account fees and price protection tolerance), your TWAP
      will not execute. CoW Swap will <strong>always</strong> improve on this price if possible.
    </Trans>
  ),
  minReceivedLabel: t`Minimum receive`,
  minReceivedTooltip: t`This is the minimum amount that you will receive across your entire TWAP order, assuming all parts of the order execute.`,
})

export interface TwapTradeConfirmationDetailsProps {
  rateInfoParams: RateInfoParams
  receiveAmountInfo: ReceiveAmountInfo
  slippage: Percent
  recipient: Nullish<string>
  recipientAddress: Nullish<string>
  account: Nullish<string>
  startTime: number | undefined
  numOfParts: number
  partDuration: number | undefined
  totalDuration: number | undefined
}

export function TwapTradeConfirmationDetails({
  rateInfoParams,
  receiveAmountInfo,
  slippage,
  recipient,
  recipientAddress,
  account,
  startTime,
  numOfParts,
  partDuration,
  totalDuration,
}: TwapTradeConfirmationDetailsProps): ReactNode {
  const confirmModalConfig = getConfirmModalConfig()
  const { allowsOffchainSigning } = useWalletDetails()
  const isRewardsRowEnabled = useIsRewardsRowEnabled()

  return (
    <>
      <TradeBasicConfirmDetails
        rateInfoParams={rateInfoParams}
        receiveAmountInfo={receiveAmountInfo}
        slippage={slippage}
        recipient={recipient}
        recipientAddress={recipientAddress}
        account={account}
        labelsAndTooltips={{
          ...confirmModalConfig,
          networkCostsSuffix: !allowsOffchainSigning ? <NetworkCostsSuffix /> : null,
          networkCostsTooltipSuffix: !allowsOffchainSigning ? (
            <>
              <br />
              <br />
              <Trans>
                Because you are using a smart contract wallet, you will pay a separate gas cost for signing the order
                placement on-chain.
              </Trans>
            </>
          ) : null,
        }}
      />
      {isRewardsRowEnabled && <AffiliateTraderRewardsRow />}
      <DividerHorizontal />
      <TwapConfirmDetails
        startTime={startTime}
        numOfParts={numOfParts}
        partDuration={partDuration}
        totalDuration={totalDuration}
      />
    </>
  )
}
