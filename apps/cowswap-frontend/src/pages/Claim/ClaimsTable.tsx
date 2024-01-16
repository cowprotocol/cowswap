import { useEffect } from 'react'

import CowProtocolImage from '@cowprotocol/assets/cow-swap/cowprotocol.svg'
import Circle from '@cowprotocol/assets/images/blue-loader.svg'
import { TokenAmount } from '@cowprotocol/ui'
import { ExternalLink } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

import CowProtocolLogo from 'legacy/components/CowProtocolLogo'
import { ClaimStatus } from 'legacy/state/claim/actions'
import { useClaimDispatchers, useClaimState, useClaimTimeInfo, useClaimLinks } from 'legacy/state/claim/hooks'
import { ClaimType } from 'legacy/state/claim/hooks/types'
import { getPaidClaims, getIndexes } from 'legacy/state/claim/hooks/utils'
import { ClaimCommonTypes, EnhancedUserClaimData } from 'legacy/state/claim/types'
import { useAllClaimingTransactionIndices } from 'legacy/state/enhancedTransactions/hooks'
import { CustomLightSpinner } from 'legacy/theme'

import { Countdown } from 'pages/Claim/Countdown'
import { ClaimTable, ClaimBreakdown, TokenLogo, BannerExplainer } from 'pages/Claim/styled'

export type ClaimsTableProps = Pick<ClaimCommonTypes, 'claims' | 'hasClaims' | 'isAirdropOnly'>

// TODO: fix in other pr
type ClaimsTableRowProps = EnhancedUserClaimData & {
  handleSelect: (event: React.ChangeEvent<HTMLInputElement>, index: number) => void
  selected: number[]
  start: number | null
  end: number | null
  isPendingClaim: boolean
}

export const ClaimTr = styled.tr<{ isPending?: boolean }>`
  > td {
    background-color: ${({ isPending }) => (isPending ? '#221954' : 'rgb(255 255 255 / 6%)')};
    cursor: ${({ isPending }) => (isPending ? 'pointer' : 'initial')};
  }
`

const ClaimsTableRow = ({
  index,
  type,
  isFree,
  isPendingClaim,
  claimAmount,
  currencyAmount,
  price,
  cost,
  handleSelect,
  selected,
  start,
  end,
}: ClaimsTableRowProps) => {
  return (
    <ClaimTr key={index} isPending={isPendingClaim}>
      <td data-title="Select">
        {' '}
        <label className="checkAll">
          {isPendingClaim ? (
            <CustomLightSpinner src={Circle} title="Claiming in progress..." alt="loader" size="24px" />
          ) : (
            <input
              onChange={(event) => handleSelect(event, index)}
              type="checkbox"
              name="check"
              checked={isFree || selected.includes(index)}
              disabled={isFree}
            />
          )}
        </label>
      </td>
      <td data-title="Type of Claim">
        {' '}
        {!isFree && <TokenLogo symbol={`${currencyAmount?.currency?.symbol}`} size={34} />}
        <CowProtocolLogo size={34} />
        <span>
          <b>{isFree ? ClaimType[type] : 'Buy vCOW'}</b>
          {!isFree && <i>with {currencyAmount?.currency?.symbol}</i>}
        </span>
      </td>
      <td data-title="Amount">
        <TokenAmount amount={claimAmount} tokenSymbol={claimAmount.currency} />
      </td>
      <td data-title="Details">
        {price && (
          <span>
            Price: {/*TODO: check quoteCurrency*/}
            <b>
              <TokenAmount amount={price} tokenSymbol={price.quoteCurrency} /> per {currencyAmount?.currency?.symbol}
            </b>
          </span>
        )}
        <span>
          Cost:{' '}
          <b>
            {' '}
            {isFree ? <span className="green">Free!</span> : <TokenAmount amount={cost} tokenSymbol={cost?.currency} />}
          </b>
        </span>
        <span>
          Vesting: <b>{type === ClaimType.Airdrop ? 'No' : '4 years (linear)'}</b>
        </span>
        <span>
          Ends in: <b>{start && end && <Countdown start={start} end={end} />}</b>
        </span>
      </td>
    </ClaimTr>
  )
}

export default function ClaimsTable({ isAirdropOnly, claims, hasClaims }: ClaimsTableProps) {
  const { selectedAll, selected, activeClaimAccount, claimStatus, isInvestFlowActive } = useClaimState()

  const { setSelectedAll, setSelected } = useClaimDispatchers()

  const pendingClaimsSet = useAllClaimingTransactionIndices()

  const claimLinks = useClaimLinks()

  const { deployment: start, investmentDeadline, airdropDeadline } = useClaimTimeInfo()

  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const checked = event.target.checked
    const output = [...selected]
    checked ? output.push(index) : output.splice(output.indexOf(index), 1)
    setSelected(output)
  }

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked
    const paid = getIndexes(getPaidClaims(claims))
    setSelected(checked ? paid : [])
    setSelectedAll(checked)
  }

  const paidClaims = getPaidClaims(claims)

  useEffect(() => {
    setSelectedAll(selected.length === paidClaims.length)
  }, [paidClaims.length, selected.length, setSelectedAll])

  const showTable =
    !isAirdropOnly && hasClaims && activeClaimAccount && claimStatus === ClaimStatus.DEFAULT && !isInvestFlowActive

  if (!showTable) return null

  return (
    <ClaimBreakdown>
      <p>
        The table overview below represents your current vCOW claiming opportunities. To move forward with one or all of
        the options, simply select the row(s) you would like to engage with and move forward via the &apos;Claim
        vCOW&apos; button.
      </p>
      <ClaimTable>
        <table>
          <thead>
            <tr>
              <th>
                <label className="checkAll">
                  <input checked={selectedAll} onChange={handleSelectAll} type="checkbox" name="check" />
                </label>
              </th>
              <th>Type of Claim</th>
              <th>Amount</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {claims.map((claim: EnhancedUserClaimData) => (
              <ClaimsTableRow
                key={claim.index}
                {...claim}
                isPendingClaim={pendingClaimsSet.has(claim.index)}
                selected={selected}
                handleSelect={handleSelect}
                start={start}
                end={claim.isFree ? airdropDeadline : investmentDeadline}
              />
            ))}
          </tbody>
        </table>
      </ClaimTable>
      <ExternalLink href={claimLinks.vCowPost}>
        <BannerExplainer>
          <SVG src={CowProtocolImage} description="Questions? Read More." />
          <span>
            <b>vCOW the governance token.</b>
            <small>Find out more about the protocol ↗</small>
          </span>
        </BannerExplainer>
      </ExternalLink>
    </ClaimBreakdown>
  )
}
