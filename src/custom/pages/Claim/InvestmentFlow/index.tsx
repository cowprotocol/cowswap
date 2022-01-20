import { useEffect, useMemo } from 'react'

import {
  InvestFlow,
  InvestContent,
  InvestFlowValidation,
  InvestSummaryTable,
  StepIndicator,
  Steps,
  ClaimTable,
  AccountClaimSummary,
} from 'pages/Claim/styled'
import { InvestSummaryRow } from 'pages/Claim/InvestmentFlow/InvestSummaryRow'

import { ClaimType, useClaimState, useUserEnhancedClaimData, useClaimDispatchers } from 'state/claim/hooks'
import { ClaimStatus } from 'state/claim/actions'
import { InvestClaim } from 'state/claim/reducer'
import { calculateInvestmentAmounts } from 'state/claim/hooks/utils'

import { ApprovalState, OptionalApproveCallbackParams } from 'hooks/useApproveCallback'
import { useActiveWeb3React } from 'hooks/web3'

import InvestOption from './InvestOption'
import { ClaimCommonTypes, ClaimWithInvestmentData, EnhancedUserClaimData } from '../types'

export type InvestOptionProps = {
  claim: EnhancedUserClaimData
  optionIndex: number
  approveData:
    | { approveState: ApprovalState; approveCallback: (optionalParams?: OptionalApproveCallbackParams) => void }
    | undefined
}

type InvestmentFlowProps = Pick<ClaimCommonTypes, 'hasClaims'> & {
  isAirdropOnly: boolean
  gnoApproveData: InvestOptionProps['approveData']
  usdcApproveData: InvestOptionProps['approveData']
}

type TokenApproveName = 'gnoApproveData' | 'usdcApproveData'
type TokenApproveData = {
  [key in TokenApproveName]: InvestOptionProps['approveData'] | undefined
}

// map claim type to token approve data
function _claimToTokenApproveData(claimType: ClaimType, tokenApproveData: TokenApproveData) {
  switch (claimType) {
    case ClaimType.GnoOption:
      return tokenApproveData.gnoApproveData
    case ClaimType.Investor:
      return tokenApproveData.usdcApproveData
    default:
      return undefined
  }
}

function _classifyAndFilterClaimData(claimData: EnhancedUserClaimData[], selected: number[]) {
  const paid: EnhancedUserClaimData[] = []
  const free: EnhancedUserClaimData[] = []

  claimData.forEach((claim) => {
    if (claim.isFree) {
      free.push(claim)
    } else if (selected.includes(claim.index)) {
      paid.push(claim)
    }
  })
  return [free, paid]
}

function _enhancedUserClaimToClaimWithInvestment(
  claim: EnhancedUserClaimData,
  investFlowData: InvestClaim[]
): ClaimWithInvestmentData {
  const investmentAmount = claim.isFree
    ? undefined
    : investFlowData.find(({ index }) => index === claim.index)?.investedAmount

  return { ...claim, ...calculateInvestmentAmounts(claim, investmentAmount) }
}

export default function InvestmentFlow({ hasClaims, isAirdropOnly, ...tokenApproveData }: InvestmentFlowProps) {
  const { account } = useActiveWeb3React()
  const { selected, activeClaimAccount, claimStatus, isInvestFlowActive, investFlowStep, investFlowData } =
    useClaimState()
  const { initInvestFlowData } = useClaimDispatchers()
  const claimData = useUserEnhancedClaimData(activeClaimAccount)

  // Filtering and splitting claims into free and selected paid claims
  // `selectedClaims` are used on step 1 and 2
  // `freeClaims` are used on step 2
  const [freeClaims, selectedClaims] = useMemo(
    () => _classifyAndFilterClaimData(claimData, selected),
    [claimData, selected]
  )

  // Merge all claims together again, with their investment data for step 2
  const allClaims: ClaimWithInvestmentData[] = useMemo(
    () =>
      freeClaims.concat(selectedClaims).map((claim) => _enhancedUserClaimToClaimWithInvestment(claim, investFlowData)),
    [freeClaims, investFlowData, selectedClaims]
  )

  useEffect(() => {
    initInvestFlowData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInvestFlowActive])

  if (
    !activeClaimAccount || // no connected account
    !hasClaims || // no claims
    !isInvestFlowActive || // not on correct step (account change in mid step)
    claimStatus !== ClaimStatus.DEFAULT || // not in default claim state
    isAirdropOnly // is only for airdrop
  ) {
    return null
  }

  return (
    <InvestFlow>
      <StepIndicator>
        <Steps step={investFlowStep}>
          <li>Allowances: Approve all tokens to be used for investment.</li>
          <li>Submit and confirm the transaction to claim vCOW</li>
        </Steps>
        <h1>
          {investFlowStep === 0
            ? 'Claiming vCOW is a two step process'
            : investFlowStep === 1
            ? 'Set allowance to Buy vCOW'
            : 'Confirm transaction to claim all vCOW'}
        </h1>
      </StepIndicator>

      {/* Invest flow: Step 1 > Set allowances and investment amounts */}
      {investFlowStep === 1 ? (
        <InvestContent>
          <p>
            Your account can participate in the investment of vCOW. Each investment opportunity will allow you to invest
            up to a predefined maximum amount of tokens{' '}
          </p>

          {selectedClaims.map((claim, index) => (
            <InvestOption
              key={claim.index}
              optionIndex={index}
              approveData={_claimToTokenApproveData(claim.type, tokenApproveData)}
              claim={claim}
            />
          ))}

          <InvestFlowValidation>Approve all investment tokens before continuing</InvestFlowValidation>
        </InvestContent>
      ) : null}

      {/* Invest flow: Step 2 > Review summary */}
      {investFlowStep === 2 ? (
        <InvestContent>
          <ClaimTable>
            <InvestSummaryTable>
              <thead>
                <tr>
                  <th>Claim type</th>
                  <th>Amount to receive</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {allClaims.map((claim) => (
                  <InvestSummaryRow claim={claim} key={claim.index} />
                ))}
              </tbody>
            </InvestSummaryTable>
          </ClaimTable>

          <AccountClaimSummary>
            <span>
              <b>Claiming with account:</b>
              <i>{account} (connected account)</i>
            </span>
            <span>
              {' '}
              <b>Receiving account:</b>
              <i>{activeClaimAccount}</i>
            </span>
          </AccountClaimSummary>

          <h4>Ready to claim your vCOW?</h4>
          <p>
            <b>What will happen?</b> By sending this Ethereum transaction, you will be investing tokens from the
            connected account and exchanging them for vCOW tokens that will be received by the claiming account
            specified above.
          </p>
          <p>
            <b>Can I modify the invested amounts or invest partial amounts later?</b> No. Once you send the transaction,
            you cannot increase or reduce the investment. Investment opportunities can only be exercised once.
          </p>
          <p>
            <b>Important!</b> Please make sure you intend to claim and send vCOW to the mentioned receiving account(s)
          </p>
        </InvestContent>
      ) : null}
    </InvestFlow>
  )
}
