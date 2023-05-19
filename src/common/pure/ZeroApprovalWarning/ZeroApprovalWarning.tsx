import { HashLink } from 'react-router-hash-link'
import { WarningCard } from '../WarningCard'
import styled from 'styled-components/macro'

const Link = styled(HashLink)`
  text-decoration: underline;
`

export function ZeroApprovalWarning() {
  return (
    <WarningCard>
      <strong>Note:</strong> USDT specifically requires 2 approval transactions. The first resets your spending cap to
      0, and the second sets your desired spending cap. To avoid this in the future, set your spending cap to CoW Swap's
      recommended default amount. <Link to="/faq">Learn more</Link>
    </WarningCard>
  )
}
