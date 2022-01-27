import { useEffect, useMemo } from 'react'
import { CurrencyAmount } from '@uniswap/sdk-core'

import {
  InvestFlow,
  InvestContent,
  InvestFlowValidation,
  InvestSummaryTable,
  ClaimTable,
  AccountClaimSummary,
  StepExplainer,
  Badge,
  UserMessage,
} from 'pages/Claim/styled'
import { InvestSummaryRow } from 'pages/Claim/InvestmentFlow/InvestSummaryRow'
import { ClaimSummaryView } from 'pages/Claim/ClaimSummary'

import { Stepper } from 'components/Stepper'
import { FaqDrawer } from 'components/FaqDrawer'

import {
  useClaimState,
  useUserEnhancedClaimData,
  useClaimDispatchers,
  useHasClaimInvestmentFlowError,
  useSomeNotTouched,
} from 'state/claim/hooks'
import { ClaimStatus } from 'state/claim/actions'
import { InvestClaim } from 'state/claim/reducer'
import { calculateInvestmentAmounts } from 'state/claim/hooks/utils'

import { useActiveWeb3React } from 'hooks/web3'

import InvestOption from './InvestOption'
import { ClaimCommonTypes, ClaimWithInvestmentData, EnhancedUserClaimData } from '../types'
import { COW_LINKS } from 'pages/Claim'
import { ExternalLink } from 'theme'
import { ExplorerLink } from 'components/ExplorerLink'
import { ExplorerDataType } from 'utils/getExplorerLink'

import { BadgeVariant } from 'components/Badge'
import { OperationType } from 'components/TransactionConfirmationModal'
import RoundArrow from 'assets/cow-swap/round-arrow.svg'
import ImportantIcon from 'assets/cow-swap/important.svg'
import SVG from 'react-inlinesvg'

const STEPS_DATA = [
  {
    title: 'Start',
  },
  {
    title: 'Set allowances',
    subtitle: 'Approve all tokens to be used for investment.',
  },
  {
    title: 'Submit claim',
    subtitle: 'Submit and confirm the transaction to claim vCOW.',
  },
]

const FAQ_DATA = [
  {
    title: 'What will happen?',
    content:
      'By sending this Ethereum transaction, you will be investing tokens from the connected account and exchanging them for vCOW tokens that will be received by the claiming account specified above.',
  },
  {
    title: 'Can I modify (partial) invested amounts later?',
    content:
      'No. Once you send the transaction, you cannot increase or reduce the investment. Investment opportunities can only be exercised once.',
  },
]

export type InvestmentFlowProps = Pick<ClaimCommonTypes, 'hasClaims'> & {
  isAirdropOnly: boolean
  modalCbs: {
    openModal: (message: string, operationType: OperationType) => void
    closeModal: () => void
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

function _calculateTotalVCow(allClaims: ClaimWithInvestmentData[]) {
  // Re-use the vCow instance, if there's any claim at all
  const zeroVCow = allClaims[0] && CurrencyAmount.fromRawAmount(allClaims[0].claimAmount.currency, '0')

  if (!zeroVCow) {
    return
  }

  // Sum up all the vCowAmount being claimed
  return allClaims.reduce<typeof zeroVCow>(
    (total, { vCowAmount }) => total.add(vCowAmount?.wrapped || zeroVCow),
    zeroVCow
  )
}

type AccountDetailsProps = {
  isClaimer?: boolean
  label: string
  account: string
  connectedAccount: string
}

function AccountDetails({ isClaimer, label, account, connectedAccount }: AccountDetailsProps) {
  return (
    <div>
      {isClaimer && (
        <div>
          <SVG src={RoundArrow} description="Arrow" />
        </div>
      )}
      <span>
        <b>{label}</b>
        <i>
          <ExplorerLink id={account} label={account} type={ExplorerDataType.ADDRESS} />
        </i>
        {account === connectedAccount ? (
          <Badge variant={BadgeVariant.POSITIVE}>&nbsp; Connected account</Badge>
        ) : (
          <Badge variant={BadgeVariant.WARNING}>&nbsp; External account</Badge>
        )}
      </span>
    </div>
  )
}

export default function InvestmentFlow({ hasClaims, isAirdropOnly, modalCbs }: InvestmentFlowProps) {
  const { account } = useActiveWeb3React()
  const { selected, activeClaimAccount, claimStatus, isInvestFlowActive, investFlowStep, investFlowData } =
    useClaimState()
  const { initInvestFlowData } = useClaimDispatchers()
  const claimData = useUserEnhancedClaimData(activeClaimAccount)

  const hasError = useHasClaimInvestmentFlowError()
  const someNotTouched = useSomeNotTouched()

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
  const totalVCow = useMemo(() => _calculateTotalVCow(allClaims), [allClaims])

  useEffect(() => {
    initInvestFlowData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInvestFlowActive])

  if (
    !account || // no connected account
    !activeClaimAccount || // no selected account for claiming
    !hasClaims || // no claims
    !isInvestFlowActive || // not on correct step (account change in mid-step)
    claimStatus !== ClaimStatus.DEFAULT || // not in default claim state
    isAirdropOnly // is only for airdrop
  ) {
    return null
  }

  return (
    <InvestFlow>
      <Stepper steps={STEPS_DATA} activeStep={investFlowStep} />

      <h1>
        {investFlowStep === 0
          ? 'Claim and invest'
          : investFlowStep === 1
          ? 'Set allowance to Buy vCOW'
          : 'Confirm transaction to claim all vCOW'}
      </h1>

      {investFlowStep === 0 && (
        <>
          <p>
            You have chosen to exercise one or more investment opportunities alongside claiming your airdrop. Exercising
            your investment options will give you the chance to acquire vCOW tokens at a fixed price. This process
            consists of two steps.
          </p>
          <StepExplainer>
            <span data-step="Step 1">
              <p>
                Define the amount you would like to invest and set the required allowances for the token you are
                purchasing vCOW with.
              </p>
            </span>
            <span data-step="Step 2">
              <p>
                Claim your vCOW tokens for the Airdrop (available immediately) and for your investment (vesting linearly
                over 4 years).
              </p>
            </span>
          </StepExplainer>
          <p>
            For more details around the token, please read{' '}
            <ExternalLink href={COW_LINKS.vCowPost}>the blog post</ExternalLink>. For more details about the claiming
            process, please read <ExternalLink href={COW_LINKS.stepGuide}>step by step guide</ExternalLink>.
          </p>
        </>
      )}

      {/* Invest flow: Step 1 > Set allowances and investment amounts */}
      {investFlowStep === 1 ? (
        <InvestContent>
          <p>
            Your account can participate in the investment of vCOW. Each investment opportunity will allow you to invest
            up to a predefined maximum amount of tokens{' '}
          </p>

          {selectedClaims.map((claim, index) => (
            <InvestOption key={claim.index} optionIndex={index} claim={claim} {...modalCbs} />
          ))}

          {hasError && <InvestFlowValidation>Fix the errors before continuing</InvestFlowValidation>}
          {!hasError && someNotTouched && (
            <InvestFlowValidation>Investment Amount is required to continue</InvestFlowValidation>
          )}
        </InvestContent>
      ) : null}
      {/* Invest flow: Step 2 > Review summary */}
      {investFlowStep === 2 ? (
        <InvestContent>
          <ClaimSummaryView totalAvailableAmount={totalVCow} totalAvailableText={'Total amount to claim'} />
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
            <AccountDetails isClaimer label="Claiming with" account={account} connectedAccount={account} />
            <AccountDetails label="Receiving on" account={activeClaimAccount} connectedAccount={account} />
          </AccountClaimSummary>

          <h4>Ready to claim your vCOW?</h4>
          <FaqDrawer items={FAQ_DATA} />
          <UserMessage>
            <SVG src={ImportantIcon} description="Important!" />
            <span>
              <b>Important!</b> Please make sure you intend to claim and send vCOW to the above mentioned receiving
              account.
            </span>
          </UserMessage>
        </InvestContent>
      ) : null}
    </InvestFlow>
  )
}
