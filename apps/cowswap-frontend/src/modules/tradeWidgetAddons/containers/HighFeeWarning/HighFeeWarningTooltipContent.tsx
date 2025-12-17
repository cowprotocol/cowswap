import { ReactNode } from 'react'

import { Fraction } from '@uniswap/sdk-core'

import { Trans } from '@lingui/react/macro'

interface HighFeeWarningTooltipContentProps {
  isHighFee?: boolean
  feePercentage?: Fraction
  isHighBridgeFee?: boolean
  bridgeFeePercentage?: Fraction
}

const Wrapper = ({ children }: { children: ReactNode }): ReactNode => {
  return (
    <div>
      <small>{children}</small>
    </div>
  )
}

const CommonContent = (): ReactNode => {
  return (
    <Trans>
      <br />
      <br />
      Consider waiting for lower network costs.
      <br />
      <br />
      You may still move forward with this swap but a high percentage of it will be consumed by network costs.
    </Trans>
  )
}

const NetworkCostsContent = ({ feePercentage }: { feePercentage: Fraction }): ReactNode => {
  const formattedFeePercentage = feePercentage?.toFixed(2)

  return (
    <Trans>
      Current network costs make up{' '}
      <u>
        <strong>{formattedFeePercentage}%</strong>
      </u>{' '}
      of your swap amount.
    </Trans>
  )
}

const BridgeCostsContent = ({ bridgeFeePercentage }: { bridgeFeePercentage: Fraction }): ReactNode => {
  const formattedBridgeFeePercentage = bridgeFeePercentage?.toFixed(2)
  return (
    <Trans>
      Current bridge costs make up{' '}
      <u>
        <strong>{formattedBridgeFeePercentage}%</strong>
      </u>{' '}
      of your swap amount.
    </Trans>
  )
}

export function HighFeeWarningTooltipContent({
  isHighFee,
  feePercentage,
  isHighBridgeFee,
  bridgeFeePercentage,
}: HighFeeWarningTooltipContentProps): ReactNode {
  const shouldShowSwapAndBridgeFee = isHighFee && isHighBridgeFee && feePercentage && bridgeFeePercentage
  const shouldShowSwapFee = isHighFee && feePercentage
  const shouldShowBridgeFee = isHighBridgeFee && bridgeFeePercentage

  return (
    <Wrapper>
      {shouldShowSwapFee && <NetworkCostsContent feePercentage={feePercentage} />}
      {shouldShowSwapAndBridgeFee && (
        <>
          <br />
          <br />
        </>
      )}
      {shouldShowBridgeFee && <BridgeCostsContent bridgeFeePercentage={bridgeFeePercentage} />}
      {<CommonContent />}
    </Wrapper>
  )
}
