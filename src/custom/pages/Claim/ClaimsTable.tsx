import { ClaimType, useClaimState } from 'state/claim/hooks'
import { ClaimTable, ClaimBreakdown } from 'pages/Claim/styled'
import CowProtocolLogo from 'components/CowProtocolLogo'
import { ClaimStatus } from 'state/claim/actions'
// import { UserClaimDataDetails } from './types' TODO: fix in another PR
import { formatSmart } from 'utils/format'
import { EnhancedUserClaimData } from './types'

type ClaimsTableProps = {
  handleSelectAll: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleSelect: (event: React.ChangeEvent<HTMLInputElement>, index: number) => void
  userClaimData: EnhancedUserClaimData[]
  isAirdropOnly: boolean
  hasClaims: boolean
}

// TODO: fix in other pr
type ClaimsTableRowProps = EnhancedUserClaimData &
  Pick<ClaimsTableProps, 'handleSelect'> & {
    selected: number[]
  }

const ClaimsTableRow = ({
  index,
  type,
  isFree,
  claimAmount,
  currencyAmount,
  price,
  cost,
  handleSelect,
  selected,
}: ClaimsTableRowProps) => {
  return (
    <tr key={index}>
      <td>
        {' '}
        <label className="checkAll">
          <input
            onChange={(event) => handleSelect(event, index)}
            type="checkbox"
            name="check"
            checked={isFree || selected.includes(index)}
            disabled={isFree}
          />
        </label>
      </td>
      <td>{isFree ? ClaimType[type] : `Buy vCOW with ${currencyAmount?.currency?.symbol}`}</td>
      <td>
        <CowProtocolLogo size={16} /> {formatSmart(claimAmount) || 0} vCOW
      </td>
      <td>
        <span>
          Price:{' '}
          <b>{isFree || !price ? '-' : `${formatSmart(price) || 0} vCoW per ${currencyAmount?.currency?.symbol}`}</b>
        </span>
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
          Ends in: <b>28 days, 10h, 50m</b>
        </span>
      </td>
    </tr>
  )
}

export default function ClaimsTable({
  handleSelectAll,
  handleSelect,
  userClaimData,
  isAirdropOnly,
  hasClaims,
}: ClaimsTableProps) {
  const { selectedAll, selected, activeClaimAccount, claimStatus, isInvestFlowActive } = useClaimState()

  const hideTable =
    isAirdropOnly || !hasClaims || !activeClaimAccount || claimStatus !== ClaimStatus.DEFAULT || isInvestFlowActive

  if (hideTable) return null

  return (
    <ClaimBreakdown>
      <h2>vCOW claim breakdown</h2>
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
              <ClaimsTableRow key={claim.index} {...claim} selected={selected} handleSelect={handleSelect} />
            ))}
          </tbody>
        </table>
      </ClaimTable>
    </ClaimBreakdown>
  )
}
