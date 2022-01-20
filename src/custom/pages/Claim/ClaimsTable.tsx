import { ClaimType, useClaimDispatchers, useClaimState, useClaimTimeInfo } from 'state/claim/hooks'
import styled from 'styled-components/macro'
import { ClaimTable, ClaimBreakdown, TokenLogo } from 'pages/Claim/styled'
import CowProtocolLogo from 'components/CowProtocolLogo'
import { ClaimStatus } from 'state/claim/actions'
// import { UserClaimDataDetails } from './types' TODO: fix in another PR
import { formatSmart } from 'utils/format'
import { EnhancedUserClaimData } from './types'
import { useAllClaimingTransactionIndices } from 'state/enhancedTransactions/hooks'
import { useUserEnhancedClaimData } from 'state/claim/hooks'

import { CustomLightSpinner } from 'theme'
import Circle from 'assets/images/blue-loader.svg'
import { Countdown } from 'pages/Claim/Countdown'
import { getPaidClaims, getIndexes } from 'state/claim/hooks/utils'
import { useEffect } from 'react'

export type ClaimsTableProps = {
  isAirdropOnly: boolean
  hasClaims: boolean
}

// TODO: fix in other pr
type ClaimsTableRowProps = EnhancedUserClaimData & {
  handleSelect: (event: React.ChangeEvent<HTMLInputElement>, index: number) => void
  selected: number[]
  start: number | null
  end: number | null
  isPendingClaim: boolean
}

const ClaimTr = styled.tr<{ isPending?: boolean }>`
  > td {
    background-color: ${({ isPending }) => (isPending ? '#221954' : 'rgb(255 255 255 / 6%)')};
    cursor: ${({ isPending }) => (isPending ? 'pointer' : 'initial')};

    &:first-child {
      border-radius: 8px 0 0 8px;
    }
    &:last-child {
      border-radius: 0 8px 8px 0;
    }
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
      <td>
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
      <td>
        {' '}
        {!isFree && <TokenLogo symbol={`${currencyAmount?.currency?.symbol}`} size={32} />}
        <CowProtocolLogo size={32} />
        <span>
          <b>{isFree ? ClaimType[type] : 'Buy vCOW'}</b>
          {!isFree && <i>with {currencyAmount?.currency?.symbol}</i>}
        </span>
      </td>
      <td>{formatSmart(claimAmount) || 0} vCOW</td>
      <td>
        {!isFree ||
          (price && (
            <span>
              Price: <b>{`${formatSmart(price) || 0} vCoW per ${currencyAmount?.currency?.symbol}`}</b>
            </span>
          ))}
        <span>
          Cost:{' '}
          <b>
            {' '}
            {isFree ? (
              <span className="green">Free!</span>
            ) : (
              `${formatSmart(cost) || 0} ${currencyAmount?.currency?.symbol}`
            )}
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

export default function ClaimsTable({ isAirdropOnly, hasClaims }: ClaimsTableProps) {
  const { selectedAll, selected, activeClaimAccount, claimStatus, isInvestFlowActive } = useClaimState()

  const { setSelectedAll, setSelected } = useClaimDispatchers()

  const pendingClaimsSet = useAllClaimingTransactionIndices()

  const userClaimData = useUserEnhancedClaimData(activeClaimAccount)

  const { deployment: start, investmentDeadline, airdropDeadline } = useClaimTimeInfo()

  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const checked = event.target.checked
    const output = [...selected]
    checked ? output.push(index) : output.splice(output.indexOf(index), 1)
    setSelected(output)
  }

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked
    const paid = getIndexes(getPaidClaims(userClaimData))
    setSelected(checked ? paid : [])
    setSelectedAll(checked)
  }

  const paidClaims = getPaidClaims(userClaimData)

  useEffect(() => {
    setSelectedAll(selected.length === paidClaims.length)
  }, [paidClaims.length, selected.length, setSelectedAll])

  const showTable =
    !isAirdropOnly && hasClaims && activeClaimAccount && claimStatus === ClaimStatus.DEFAULT && !isInvestFlowActive

  if (!showTable) return null

  return (
    <ClaimBreakdown>
      <p>
        The table overview below represents your current vCow claiming opportunities. To move forward with one or all of
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
            {userClaimData.map((claim: EnhancedUserClaimData) => (
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
    </ClaimBreakdown>
  )
}
