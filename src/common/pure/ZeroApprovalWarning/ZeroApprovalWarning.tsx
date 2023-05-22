import { HashLink } from 'react-router-hash-link'
import { WarningCard } from '../WarningCard'
import styled from 'styled-components/macro'
import { Currency } from '@uniswap/sdk-core'

const Link = styled(HashLink)`
  text-decoration: underline;
`

interface ZeroApprovalWarningProps {
  currency: Currency | undefined
}

export function ZeroApprovalWarning({ currency }: ZeroApprovalWarningProps) {
  const symbol = currency?.symbol?.toUpperCase()

  if (!symbol) {
    return <></>
  }

  return (
    <WarningCard>
      <strong>Note:</strong> {symbol} specifically requires 2 approval transactions. The first resets your spending cap
      to 0, and the second sets your desired spending cap. To avoid this in the future, set your spending cap to CoW
      Swap's recommended default amount. <Link to="/faq">Learn more</Link>
    </WarningCard>
  )
}
