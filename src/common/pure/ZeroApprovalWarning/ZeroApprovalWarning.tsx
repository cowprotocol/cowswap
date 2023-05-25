import { HashLink } from 'react-router-hash-link'
import { WarningCard } from '../WarningCard'
import styled from 'styled-components/macro'
import { Currency } from '@uniswap/sdk-core'
import { Nullish } from 'types'

const Link = styled(HashLink)`
  text-decoration: underline;
`

interface ZeroApprovalWarningProps {
  currency: Nullish<Currency>
}

// TODO: Replace with FAQ link once available.
const faqLink = undefined

export function ZeroApprovalWarning({ currency }: ZeroApprovalWarningProps) {
  const symbol = currency?.symbol?.toUpperCase()

  if (!symbol) {
    return <></>
  }

  return (
    <WarningCard>
      <strong>Note:</strong> {symbol} specifically requires 2 approval transactions. The first resets your spending cap
      to 0, and the second sets your desired spending cap. To avoid this in the future, set your spending cap to CoW
      Swap's recommended default amount. {faqLink && <Link to={faqLink}>Learn more</Link>}
    </WarningCard>
  )
}
