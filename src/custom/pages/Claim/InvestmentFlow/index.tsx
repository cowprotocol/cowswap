import { useEffect, useMemo } from 'react'
import {
  InvestFlow,
  InvestContent,
  InvestFlowValidation,
  InvestTokenSubtotal,
  StepIndicator,
  Steps,
} from 'pages/Claim/styled'
import { ClaimType, useClaimState, useUserEnhancedClaimData, useClaimDispatchers } from 'state/claim/hooks'
import { ClaimCommonTypes, EnhancedUserClaimData } from '../types'
import { ClaimStatus } from 'state/claim/actions'
import { useActiveWeb3React } from 'hooks/web3'
import { ApprovalState, OptionalApproveCallbackParams } from 'hooks/useApproveCallback'
import InvestOption from './InvestOption'

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

export default function InvestmentFlow({ hasClaims, isAirdropOnly, ...tokenApproveData }: InvestmentFlowProps) {
  const { account } = useActiveWeb3React()
  const { selected, activeClaimAccount, claimStatus, isInvestFlowActive, investFlowStep } = useClaimState()
  const { initInvestFlowData } = useClaimDispatchers()
  const claimData = useUserEnhancedClaimData(activeClaimAccount)

  const selectedClaims = useMemo(() => {
    return claimData.filter(({ index }) => selected.includes(index))
  }, [claimData, selected])

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
        <h1>
          {investFlowStep === 0
            ? 'Claiming vCOW is a two step process'
            : investFlowStep === 1
            ? 'Set allowance to Buy vCOW'
            : 'Confirm transaction to claim all vCOW'}
        </h1>
        <Steps step={investFlowStep}>
          <li>Allowances: Approve all tokens to be used for investment.</li>
          <li>Submit and confirm the transaction to claim vCOW</li>
        </Steps>
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
          1. Claim airdrop: {activeClaimAccount} receives 13,120.50 vCOW (Note: please make sure you intend to claim and
          send vCOW to the mentioned account)
          <br />
          <br />
          2. Claim and invest: Investing with account: {account} (connected account). Investing: 1343 GNO (50% of
          available investing opportunity) and 32 ETH (30% of available investing opportunity)
          <br />
          <br />
          3. Receive vCOW claims on account {activeClaimAccount}: 23,947.6 vCOW - available NOW! and 120,567.12 vCOW -
          Vested linearly 4 years <br />
          <br />
          <br />
          <h4>Ready to claim your vCOW?</h4>
          <p>
            <b>What will happen?</b> By sending this Ethereum transaction, you will be investing tokens from the
            connected account and exchanging them for vCOW tokens that will be received by the claiming account
            specified above.
          </p>
          <p>
            <b>Can I modify the invested amounts or invest partial amounts later?</b> No. Once you send the transaction,
            you cannot increase or reduce the investment. Investment oportunities can only be exercised once.
          </p>
        </InvestContent>
      ) : null}
    </InvestFlow>
  )
}
