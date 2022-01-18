import { useEffect, useState, useCallback } from 'react'
import {
  InvestFlow,
  InvestContent,
  InvestFlowValidation,
  InvestTokenSubtotal,
  StepIndicator,
  Steps,
  ClaimTable,
  AccountClaimSummary,
  TokenLogo,
} from 'pages/Claim/styled'
import { ClaimType, useClaimState, useUserEnhancedClaimData } from 'state/claim/hooks'
import { ClaimCommonTypes, EnhancedUserClaimData } from '../types'
import { ClaimStatus } from 'state/claim/actions'
import { useActiveWeb3React } from 'hooks/web3'
import { ApprovalState, OptionalApproveCallbackParams } from 'hooks/useApproveCallback'
import InvestOption from './InvestOption'
import CowProtocolLogo from 'components/CowProtocolLogo'

export type InvestmentClaimProps = EnhancedUserClaimData & {
  investedAmount: string
}

export type InvestOptionProps = {
  claim: InvestmentClaimProps
  updateInvestAmount: (idx: number, investAmount: string) => void
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
  const { activeClaimAccount, claimStatus, isInvestFlowActive, investFlowStep, selected } = useClaimState()

  const claimData = useUserEnhancedClaimData(activeClaimAccount)

  const [investData, setInvestData] = useState<InvestmentClaimProps[]>([])

  useEffect(() => {
    if (claimData) {
      const data = claimData.reduce<InvestmentClaimProps[]>((acc, claim) => {
        if (selected.includes(claim.index)) {
          acc.push({ ...claim, investedAmount: '0' })
        }

        return acc
      }, [])

      setInvestData(data)
    }
  }, [selected, claimData])

  const updateInvestAmount = useCallback(
    (idx: number, investedAmount: string) => {
      const update = investData.map((claim) => (claim.index === idx ? { ...claim, investedAmount } : claim))
      setInvestData(update)
    },
    [investData]
  )

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

          {investData.map((claim) => (
            <InvestOption
              key={claim.index}
              approveData={_claimToTokenApproveData(claim.type, tokenApproveData)}
              updateInvestAmount={updateInvestAmount}
              claim={claim}
            />
          ))}

          {/* TODO: Update this with real data */}
          <InvestTokenSubtotal>
            <h3>Investment summary</h3>
            <span>
              <b>Claim account:</b> {activeClaimAccount}
            </span>
            <span>
              <b>vCOW to receive based on selected investment(s):</b> 4,054,671.28 vCOW
            </span>
          </InvestTokenSubtotal>

          <InvestFlowValidation>Approve all investment tokens before continuing</InvestFlowValidation>
        </InvestContent>
      ) : null}

      {/* Invest flow: Step 2 > Review summary */}
      {investFlowStep === 2 ? (
        <InvestContent>
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
          <ClaimTable>
            <table>
              <thead>
                <tr>
                  <th>Claim type</th>
                  <th>Account &amp; vCOW amount</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <b>Airdrop</b>
                  </td>
                  <td>
                    <span>
                      <b>Amount to receive:</b>
                      <i>13,120.50 vCOW</i>
                    </span>
                  </td>

                  <td>
                    <span>
                      <b>Cost:</b> <i>Free!</i>
                    </span>
                    <span>
                      <b>Vesting:</b>
                      <i>No</i>
                    </span>
                  </td>
                </tr>

                <tr>
                  <td>
                    {' '}
                    <TokenLogo symbol="GNO" size={32} />
                    <CowProtocolLogo size={32} />
                    <span>
                      <b>Buy vCOW</b>
                      <i>with GNO</i>
                    </span>
                  </td>

                  <td>
                    <span>
                      <b>Investment amount:</b> <i>1343 GNO (50% of available investing opportunity)</i>
                    </span>
                    <span>
                      <b>Amount to receive:</b>
                      <i>13,120.50 vCOW</i>
                    </span>
                  </td>

                  <td>
                    <span>
                      <b>Price:</b> <i>2666.6666 vCoW per GNO</i>
                    </span>
                    <span>
                      <b>Cost:</b> <i>0.783375 GNO</i>
                    </span>
                    <span>
                      <b>Vesting:</b>
                      <i>4 years (linear)</i>
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </ClaimTable>

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
          <p>
            <b>Important!</b> Please make sure you intend to claim and send vCOW to the mentioned receiving account(s)
          </p>
        </InvestContent>
      ) : null}
    </InvestFlow>
  )
}
