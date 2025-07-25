import { Fraction } from '@uniswap/sdk-core'

interface HighFeeWarningTooltipContentProps {
  isHighFee?: boolean
  feePercentage?: Fraction
  isHighBridgeFee?: boolean
  bridgeFeePercentage?: Fraction
}

const Wrapper = ({ children }: { children: React.ReactNode }): React.ReactNode => {
  return (
    <div>
      <small>{children}</small>
    </div>
  )
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
