export interface VolumeFee {
  /**
   * The fee in basis points (BPS). One basis point is equivalent to 0.01% (1/100th of a percent)
   */
  volumeBps: number

  /**
   * The Ethereum address of the partner to receive the fee.
   */
  recipient: string
}
