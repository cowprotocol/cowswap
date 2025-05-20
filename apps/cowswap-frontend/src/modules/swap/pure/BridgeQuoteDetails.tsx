import { BridgeQuoteResults } from '@cowprotocol/cow-sdk'
import { TokenAmount } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

interface BridgeQuoteDetailsProps {
  details: BridgeQuoteResults
  outputCurrency: Currency
}

/**
 * TODO: Make it beutiful
 */
export function BridgeQuoteDetails({ details, outputCurrency }: BridgeQuoteDetailsProps) {
  const bridgeFee = CurrencyAmount.fromRawAmount(outputCurrency, details.fees.bridgeFee.toString())
  const destinationGasFee = CurrencyAmount.fromRawAmount(outputCurrency, details.fees.destinationGasFee.toString())
  const totalFee = bridgeFee.add(destinationGasFee)

  return (
    <div>
      {details.expectedFillTimeSeconds && (
        <div>
          <label>Estimated execution time:</label>
          <span>{details.expectedFillTimeSeconds} sec</span>
        </div>
      )}
      <div>
        <label>Bridge Fee:</label>
        <span>
          <TokenAmount amount={bridgeFee} tokenSymbol={outputCurrency} />
        </span>
      </div>
      <div>
        <label>Bridge Gas Fee:</label>
        <span>
          <TokenAmount amount={destinationGasFee} tokenSymbol={outputCurrency} />
        </span>
      </div>
      <div>
        <label>Bridge Total Fee:</label>
        <span>
          <TokenAmount amount={totalFee} tokenSymbol={outputCurrency} />
        </span>
      </div>
    </div>
  )
}
