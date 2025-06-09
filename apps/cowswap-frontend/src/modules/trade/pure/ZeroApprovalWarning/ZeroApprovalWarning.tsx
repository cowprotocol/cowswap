import { Currency } from '@uniswap/sdk-core'

import { Link as ReactRouterLink } from 'react-router'
import styled from 'styled-components/macro'
import { Nullish } from 'types'

import { WarningCard } from 'common/pure/WarningCard'

const Link = styled(ReactRouterLink)`
  text-decoration: underline;
`

interface ZeroApprovalWarningProps {
  currency: Nullish<Currency>
}

// TODO: Replace with FAQ link once available.
const faqLink = undefined

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function ZeroApprovalWarning({ currency }: ZeroApprovalWarningProps) {
  const symbol = currency?.symbol?.toUpperCase()

  if (!symbol) {
    return <></>
  }

  return (
    <WarningCard>
      <strong>Note:</strong> {symbol} specifically requires 2 approval transactions. The first resets your spending cap
      to 0, and the second sets your desired spending cap. To avoid this in the future, set your spending cap to CoW
      Swap's recommended default amount.{' '}
      {faqLink && (
        <Link target="_blank" to={faqLink}>
          Learn more
        </Link>
      )}
    </WarningCard>
  )
}
