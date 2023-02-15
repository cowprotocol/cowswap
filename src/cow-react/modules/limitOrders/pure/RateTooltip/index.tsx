import * as styledEl from './styled'

export function TooltipFeeContent() {
  return (
    <styledEl.FeeTooltipWrapper>
      <styledEl.Content>
      <h3>CoW Swap limit orders are gasless.</h3>
      <p>CoW Swap covers all the fees (including gas) by monitoring network conditions and filling your order when the market price is slightly better than your specified limit price.
        The extra tokens we get are used to cover your fees. Then we give any leftovers back to you! <a href="https://swap.cow.fi/" target="_blank" rel="noopener nofollow noreferrer" >Learn more about limit orders.</a></p>
      </styledEl.Content>

      <styledEl.FeeItem borderTop>
        <i>You will receive at least</i>
        <span>
          <p>Limit price</p>
          <b>1273.4942 USDC</b>
        </span>
      </styledEl.FeeItem>

      <styledEl.FeeItem>
        <i>Included in the estimated execution price</i>
        <span>
          <p>Current network fees</p>
          <b>≈ 2.43 USDC</b>
        </span>
      </styledEl.FeeItem>

      <styledEl.FeeItem highlighted>
        {/* <i>Order will execute at</i> */}
        <span>
          <p>Est. execution price</p>
          <b>≈ 1271.1299 USDC</b>
        </span>
      </styledEl.FeeItem>
    </styledEl.FeeTooltipWrapper>
  )
}