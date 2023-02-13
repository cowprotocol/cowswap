import * as styledEl from './styled'

export function TooltipFeeContent() {
  return (
    <styledEl.FeeTooltipWrapper>
      <h3>CoW Swap limit orders are gasless.</h3>
      <p>CoW Swap covers all the fees (including gas) by monitoring network conditions and filling your order when the market price is slightly better than your specified limit price.
        The extra tokens we get are used to cover your fees. Then we give any leftovers back to you! <a href="https://swap.cow.fi/" target="_blank" rel="noopener nofollow noreferrer" >Learn more about limit orders.</a></p>

      <styledEl.FeeItem borderTop>
        <i>You will receive at least</i>
        <span>
          <b>Limit price</b>
          <p>1273.4942 USDC</p>
        </span>
      </styledEl.FeeItem>

      <styledEl.FeeItem>
        <i>Included in the estimated execution price</i>
        <span>
          <b>Current network fees</b>
          <p>≈ 2.43 USDC</p>
        </span>
      </styledEl.FeeItem>

      <styledEl.FeeItem highlighted>
        <i>Order will execute at</i>
        <span>
          <b>Est. execution price</b>
          <p>≈ 1271.1299 USDC</p>
        </span>
      </styledEl.FeeItem>
    </styledEl.FeeTooltipWrapper>
  )
}