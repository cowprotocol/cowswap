import { Fraction } from '@uniswap/sdk-core'

interface HighFeeWarningTooltipContentProps {
  isHighFee?: boolean
  feePercentage?: Fraction
  isHighBridgeFee?: boolean
  bridgeFeePercentage?: Fraction
}

const CommonContent = (): React.ReactNode => {
  return (
    <>
      <br />
      <br />
      Consider waiting for lower network costs.
      <br />
      <br />
      You may still move forward with this swap but a high percentage of it will be consumed by network costs.
    </>
  )
}

const NetworkCostsContent = ({ feePercentage }: { feePercentage: Fraction }): React.ReactNode => {
  return (
    <>
      Current network costs make up{' '}
      <u>
        <strong>{feePercentage?.toFixed(2)}%</strong>
      </u>{' '}
      of your swap amount.
    </>
  )
}

const BridgeCostsContent = ({ bridgeFeePercentage }: { bridgeFeePercentage: Fraction }): React.ReactNode => {
  return (
    <>
      Current bridge costs make up{' '}
      <u>
        <strong>{bridgeFeePercentage?.toFixed(2)}%</strong>
      </u>{' '}
      of your swap amount.
    </>
  )
}

const HighSwapAndBridgeFeeContent = ({
  feePercentage,
  bridgeFeePercentage,
}: {
  feePercentage: Fraction
  bridgeFeePercentage: Fraction
}): React.ReactNode => {
  return (
    <div>
      <small>
        <NetworkCostsContent feePercentage={feePercentage} />
        <br />
        <br />
        <BridgeCostsContent bridgeFeePercentage={bridgeFeePercentage} />
        {<CommonContent />}
      </small>
    </div>
  )
}

const HighSwapFeeContent = ({ feePercentage }: { feePercentage: Fraction }): React.ReactNode => {
  return (
    <div>
      <small>
        <NetworkCostsContent feePercentage={feePercentage} />
        {<CommonContent />}
      </small>
    </div>
  )
}

export function HighFeeWarningTooltipContent({
  isHighFee,
  feePercentage,
  isHighBridgeFee,
  bridgeFeePercentage,
}: HighFeeWarningTooltipContentProps): React.ReactNode {
  const shouldShowSwapAndBridgeFee = isHighFee && isHighBridgeFee && feePercentage && bridgeFeePercentage
  const shouldShowSwapFee = isHighFee && !isHighBridgeFee && feePercentage
  const shouldShowBridgeFee = !isHighFee && isHighBridgeFee && bridgeFeePercentage

  return (
    <div>
      <small>
        {shouldShowSwapAndBridgeFee && (
          <HighSwapAndBridgeFeeContent feePercentage={feePercentage} bridgeFeePercentage={bridgeFeePercentage} />
        )}
        {shouldShowSwapFee && <HighSwapFeeContent feePercentage={feePercentage} />}
        {shouldShowBridgeFee && <BridgeCostsContent bridgeFeePercentage={bridgeFeePercentage} />}
      </small>
    </div>
  )
}
