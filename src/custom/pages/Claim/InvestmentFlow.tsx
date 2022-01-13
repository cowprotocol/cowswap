import {
  InvestFlow,
  InvestContent,
  InvestTokenGroup,
  InvestInput,
  InvestAvailableBar,
  InvestSummary,
  InvestFlowValidation,
  InvestTokenSubtotal,
  StepIndicator,
  Steps,
  TokenLogo,
} from 'pages/Claim/styled'
import CowProtocolLogo from 'components/CowProtocolLogo'
import { useClaimState } from 'state/claim/hooks'
import { ClaimCommonTypes } from './types'
import { ClaimStatus } from 'state/claim/actions'
import { useActiveWeb3React } from 'hooks/web3'
import { ApprovalState } from 'hooks/useApproveCallback'
import { CheckCircle } from 'react-feather'
import Row from 'components/Row'

type InvestmentFlowProps = Pick<ClaimCommonTypes, 'hasClaims'> & {
  isAirdropOnly: boolean
  approveState: ApprovalState
  approveCallback: () => void
}

export default function InvestmentFlow({
  hasClaims,
  isAirdropOnly,
  approveState,
  approveCallback,
}: InvestmentFlowProps) {
  const { account } = useActiveWeb3React()

  const { activeClaimAccount, claimStatus, isInvestFlowActive, investFlowStep } = useClaimState()

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
          <InvestTokenGroup>
            <div>
              <span>
                <TokenLogo symbol={'GNO'} size={72} />
                <CowProtocolLogo size={72} />
              </span>
              <h3>Buy vCOW with GNO</h3>
            </div>

            <span>
              <InvestSummary>
                <span>
                  <b>Price</b> <i>16.66 vCoW per GNO</i>
                </span>
                <span>
                  <b>Token approval</b>
                  <i>
                    {approveState === ApprovalState.NOT_APPROVED ? (
                      'GNO not approved'
                    ) : (
                      <Row>
                        GNO approved <CheckCircle color="lightgreen" style={{ marginLeft: 5 }} />
                      </Row>
                    )}
                  </i>
                  {approveState === ApprovalState.NOT_APPROVED && (
                    <button onClick={approveCallback}>Approve GNO</button>
                  )}
                </span>
                <span>
                  <b>Max. investment available</b> <i>2,500.04 GNO</i>
                </span>
                <span>
                  <b>Available investment used</b> <InvestAvailableBar percentage={50} />
                </span>
              </InvestSummary>
              <InvestInput>
                <div>
                  <span>
                    <b>Balance:</b> <i>10,583.34 GNO</i>
                    {/* Button should use the max possible amount the user can invest, considering their balance + max investment allowed */}
                    <button>Invest max. possible</button>
                  </span>
                  <label>
                    <b>GNO</b>
                    <input placeholder="0" />
                  </label>
                  <i>Receive: 32,432.54 vCOW</i>
                  {/* Insufficient balance validation error */}
                  <small>
                    Insufficient balance to invest. Adjust the amount or go back to remove this investment option.
                  </small>
                </div>
              </InvestInput>
            </span>
          </InvestTokenGroup>

          <InvestTokenGroup>
            <div>
              <span>
                <TokenLogo symbol={'ETH'} size={72} />
                <CowProtocolLogo size={72} />
              </span>
              <h3>Buy vCOW with ETH</h3>
            </div>

            <span>
              <InvestSummary>
                <span>
                  <b>Price</b> <i>16.66 vCoW per ETH</i>
                </span>
                <span>
                  <b>Token approval</b>
                  <i>
                    <Row>
                      Not required for ETH! <CheckCircle color="lightgreen" style={{ marginLeft: 5 }} />
                    </Row>
                  </i>
                </span>
                <span>
                  <b>Max. investment available</b> <i>2,500.04 ETH</i>
                </span>
                <span>
                  <b>Available investment used</b> <InvestAvailableBar percentage={50} />
                </span>
              </InvestSummary>
              <InvestInput>
                <div>
                  <span>
                    <b>Balance:</b> <i>10,583.34 ETH</i>
                    {/* Button should use the max possible amount the user can invest, considering their balance + max investment allowed */}
                    <button>Invest max. possible</button>
                  </span>
                  <label>
                    <b>ETH</b>
                    <input placeholder="0" />
                  </label>
                  <i>Receive: 32,432.54 vCOW</i>
                  {/* Insufficient balance validation error */}
                  <small>
                    Insufficient balance to invest. Adjust the amount or go back to remove this investment option.
                  </small>
                </div>
              </InvestInput>
            </span>
          </InvestTokenGroup>

          <InvestTokenSubtotal>
            {activeClaimAccount} will receive: 4,054,671.28 vCOW based on investment(s)
          </InvestTokenSubtotal>

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
