import { useState, useEffect } from 'react'
import CowProtocolLogo from 'components/CowProtocolLogo'
import { ButtonPrimary, ButtonSecondary } from 'components/Button'
import { Trans } from '@lingui/macro'
import { ExternalLink, CustomLightSpinner } from 'theme'
import { isAddress } from 'ethers/lib/utils'
import Circle from 'assets/images/blue-loader.svg'
// import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { useActiveWeb3React } from 'hooks/web3'
import Confetti from 'components/Confetti'
import {
  Demo,
  DemoToggle,
  PageWrapper,
  ConfirmOrLoadingWrapper,
  ConfirmedIcon,
  AttemptFooter,
  CheckIcon,
  ClaimSummary,
  ClaimTotal,
  IntroDescription,
  ClaimTable,
  ClaimAccount,
  EligibleBanner,
  InputField,
  InputError,
  CheckAddress,
  ClaimBreakdown,
  FooterNavButtons,
  TopNav,
  InvestFlow,
  InvestContent,
  InvestTokenGroup,
  InvestInput,
  InvestAvailableBar,
  InvestSummary,
  InvestFlowValidation,
  StepIndicator,
  Steps,
  TokenLogo,
} from './styled'

export default function Claim() {
  const { account, chainId } = useActiveWeb3React()

  const dummyIdenticon =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAAAXNSR0IArs4c6QAAA4ZJREFUeF7t3b1xFUEQReF5Jpj4BCC5CoIgiIFoSEAOyoEsZJEAPiaYojAxtWerWlvzye/96T5zb8/MW83t8enuZQ3+fb2/Dd59/tZffoymf90AMAsBACjAKIEUYDT9a1EACjCKIAUYTT8FWGYBZgHDY3D29noAPcAogXqA0fTrAfQAVgItBU+KEAuYzP5iASyABbCASRFiAZPZfwsW8PB8P7sUNVyA3W9/A8DeCABg7/ovAABAD7AzAxRg5+qvxQI2rz8AAGAdYGsG9ABbl18PsHn5AQAAS8F7M6AH2Lv+poGb1x8AAIjrAPXDhm8//6QafP74LsXX4Onnr19W5R4AALMAA4ACJBGjACl9a7GA+LPm6QTG+gNAD6AHSIOIArRZjCZQE5gGoCYwpU8TmP/LFQtgAWkMWgls31aygIQfC2ABw3sZZgFmAUnDWEBKHwtgAbtbQBxAGaB6/+n46uH1+bMF1Aeoewn1/tPxAIi7idMFrPcHAAAqQymeBaT09WAKQAE6ReEKFCAk74xQCkABzuDo8DUowOHUnRNIASjAOSQdvAoFOJi4s8IoAAU4i6VD16EAh9J2XhAFoADn0XTgShTgQNLODKEAFOBMnl59rawA09u50yPo6u8PgFePmf8DADAs4RTg4t8FxAE4fuoYBaAAleEUXxVQD5DSP3/wIwCGTx9nASwgakgLpwAUIBGkB0jp0wOMf9lTJTDW//LvTwEiAZpATWBEqIVXBaQALf8s4OoSGOsPAAC8VIZSfLaAx6e70TeoL3B1AKef/waANADzbiQA4kredAKvrmAUoAkABYj5u3wCKUAk4OoJvPrzs4DNAQYAAKwDFAZYQMneWprA4c00FrA5wAAAgB6gMKAHKNnTA4xvJ7OAzQEGAABaD1CPfYv5X1c/NWz6/bMCAKCdHQyAmAEK0A6epAARwKsrIAAAoAksDFCAeGxaSf6/WD2AHqAylOIpAAVIANXgqoCawFgBCkABIkItnAJc/PTwVv7eBLOAWAEWwAIiQi2cBbCARBALSOlb6/IW8PB8n/4/QP06tybw16f3sYQt/MP33+kCVcLrbxLH/0cQANpSLgAoQFIgCpDStxYLiJ82sQAWkMagJvDiR8ZQAApAAUIGzALMAgI+a5kFpPSZBeSPG/UAeoA0Bs0CzAISQDXYQpCFoMSQzaD4gxIWwALSCKzBV7eAv6T9ww6D8p2HAAAAAElFTkSuQmCC'

  // Fake states ============================
  const [showDemo, setShowDemo] = useState(false)
  const [inputAddress, setInputAddress] = useState('')
  const [isInputAddressValid, setIsInputAddressValid] = useState(false)
  const [activeClaimAccount, setActiveClaimAccount] = useState('')
  const [isAirdropOnly, setIsAirdropOnly] = useState(false)
  const [hasClaims, setHasClaims] = useState(false)
  const [isInvestFlowActive, setIsInvestFlowActive] = useState(false)
  const [isInvestFlowStep, setIsInvestFlowStep] = useState(0)
  const [claimConfirmed, setClaimConfirmed] = useState(false)
  const [claimAttempting, setClaimAttempting] = useState(false)
  const [claimSubmitted, setClaimSubmitted] = useState(false)
  const [unclaimedAmount, setUnclaimedAmount] = useState(0)
  const activeClaimAccountENS = 'TestAccount.eth'
  // =========================================

  useEffect(() => {
    setIsInputAddressValid(isAddress(inputAddress))
    setHasClaims(unclaimedAmount > 0 ? true : false)
  }, [inputAddress, unclaimedAmount, claimConfirmed])

  return (
    <PageWrapper>
      {/* DEMO ONLY */}
      <DemoToggle onClick={() => setShowDemo(!showDemo)}>Toggle DEMO Panel ({String(showDemo)})</DemoToggle>
      {showDemo && (
        <Demo>
          <table>
            <tbody>
              <tr>
                <td>inputAddress</td>
                <td>{String(inputAddress)}</td>
              </tr>
              <tr>
                <td>isInputAddressValid</td>
                <td>{String(isInputAddressValid)}</td>
              </tr>
              <tr>
                <td>web3 connected account</td>
                <td>{String(account)}</td>
              </tr>
              <tr>
                <td>web3 connected chainId</td>
                <td>{String(chainId)}</td>
              </tr>
              <tr>
                <td>activeClaimAccount</td>
                <td>
                  {' '}
                  <button onClick={() => setActiveClaimAccount(activeClaimAccount ? '' : '0x343200043040')}>
                    Toggle ({String(activeClaimAccount)})
                  </button>
                </td>
              </tr>

              <tr>
                <td>activeClaimAccountENS</td>
                <td>{activeClaimAccountENS}</td>
              </tr>
              <tr>
                <td>hasClaims</td>
                <td>
                  {' '}
                  <button onClick={() => setHasClaims(!hasClaims)}>Toggle ({String(hasClaims)})</button>
                </td>
              </tr>
              <tr>
                <td>isAirdropOnly</td>
                <td>
                  {' '}
                  <button onClick={() => setIsAirdropOnly(!isAirdropOnly)}>Toggle ({String(isAirdropOnly)})</button>
                </td>
              </tr>
              <tr>
                <td>isInvestFlowActive</td>
                <td>
                  {' '}
                  <button onClick={() => setIsInvestFlowActive(!isInvestFlowActive)}>
                    Toggle ({String(isInvestFlowActive)})
                  </button>
                </td>
              </tr>
              <tr>
                <td>isInvestFlowStep</td>
                <td>{String(isInvestFlowStep)}</td>
              </tr>
              <tr>
                <td>claimConfirmed</td>
                <td>
                  {' '}
                  <button onClick={() => setClaimConfirmed(!claimConfirmed)}>Toggle ({String(claimConfirmed)})</button>
                </td>
              </tr>
              <tr>
                <td>claimAttempting</td>
                <td>
                  {' '}
                  <button onClick={() => setClaimAttempting(!claimAttempting)}>
                    Toggle ({String(claimAttempting)})
                  </button>
                </td>
              </tr>
              <tr>
                <td>claimSubmitted</td>
                <td>
                  {' '}
                  <button onClick={() => setClaimSubmitted(!claimSubmitted)}>Toggle ({String(claimSubmitted)})</button>
                </td>
              </tr>
              <tr>
                <td>unclaimedAmount</td>
                <td>
                  {' '}
                  <button onClick={() => setUnclaimedAmount(unclaimedAmount < 1 ? 39234238586 : 0)}>
                    Toggle ({String(unclaimedAmount)})
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </Demo>
      )}
      {/* DEMO ONLY */}
      {/* If claim is confirmed > trigger confetti effect */}
      <Confetti start={claimConfirmed} />
      {/* START -- Top nav buttons */}
      {activeClaimAccount && (
        <TopNav>
          <ClaimAccount>
            <div>
              <img src={dummyIdenticon} alt={activeClaimAccount} />
              <p>{activeClaimAccountENS ? activeClaimAccountENS : activeClaimAccount}</p>
            </div>
            <ButtonSecondary onClick={() => setActiveClaimAccount('')}>Change account</ButtonSecondary>
          </ClaimAccount>
        </TopNav>
      )}
      {/* END -- Top nav buttons */}
      {/* START - Show general title OR total to claim (user has airdrop or airdrop+investment) --------------------------- */}
      {(!claimAttempting || !claimConfirmed || !claimSubmitted) &&
        activeClaimAccount &&
        hasClaims &&
        !isInvestFlowActive && (
          <EligibleBanner>
            <CheckIcon />
            <Trans>This account is eligible for vCOW token claims!</Trans>
          </EligibleBanner>
        )}
      {(!claimAttempting || !claimConfirmed || !claimSubmitted) && !isInvestFlowActive && (
        <ClaimSummary>
          <CowProtocolLogo size={100} />
          {!activeClaimAccount && !hasClaims && (
            <h1>
              <Trans>
                Claim <b>vCOW</b> token
              </Trans>
            </h1>
          )}
          {activeClaimAccount && (
            <div>
              <ClaimTotal>
                <b>Total available to claim</b>
                <p>{unclaimedAmount} vCOW</p>
              </ClaimTotal>
            </div>
          )}
        </ClaimSummary>
      )}
      {/* END - Show total to claim (user has airdrop or airdrop+investment) --------------------------- */}
      {/* START - Get address/ENS (user not connected yet or opted for checking 'another' account) */}
      {!activeClaimAccount && !claimConfirmed && (
        <CheckAddress>
          <p>
            Enter an address to check for any eligible vCOW claims{' '}
            <ButtonSecondary onClick={() => setActiveClaimAccount('0x0000000000000000000000000000')}>
              <Trans>or connect a wallet</Trans>
            </ButtonSecondary>
          </p>
          <InputField>
            <b>Input address</b>
            <input
              placeholder="Address or ENS name"
              value={inputAddress}
              onChange={(e) => setInputAddress(e.currentTarget.value)}
            />
          </InputField>
          {!isInputAddressValid && <InputError>Incorrect address</InputError>}
        </CheckAddress>
      )}
      {/* END - Get address/ENS (user not connected yet or opted for checking 'another' account) */}
      {/* START -- IS Airdrop only (simple)  ----------------------------------------------------- */}
      {activeClaimAccount && hasClaims && isAirdropOnly && !claimAttempting && !claimConfirmed && (
        <IntroDescription>
          <p>
            <Trans>
              Thank you for being a supporter of CowSwap and the CoW protocol. As an important member of the CowSwap
              Community you may claim vCOW to be used for voting and governance. You can claim your tokens until{' '}
              <i>[XX-XX-XXXX - XX:XX GMT]</i>
              <ExternalLink href="https://cow.fi/">Read more about vCOW</ExternalLink>
            </Trans>
          </p>
        </IntroDescription>
      )}
      {/* END -- IS Airdrop only (simple)  ---------------------------------------- */}

      {/* START -- NO CLAIMS  ----------------------------------------------------- */}
      {activeClaimAccount && !hasClaims && !claimAttempting && !claimConfirmed && (
        <IntroDescription>
          <Trans>
            Unfortunately this account is not eligible for any vCOW claims.{' '}
            <ButtonSecondary onClick={() => setActiveClaimAccount('')}>Try another account</ButtonSecondary> or
            <ExternalLink href="https://cow.fi/">read more about vCOW</ExternalLink>
          </Trans>
        </IntroDescription>
      )}
      {/* END ---- NO CLAIMS  ----------------------------------------------------- */}

      {/* START - Try claiming or inform succesfull claim  ---------------------- */}
      {activeClaimAccount && (claimAttempting || claimConfirmed) && (
        <ConfirmOrLoadingWrapper activeBG={true}>
          <ConfirmedIcon>
            {!claimConfirmed ? (
              <CustomLightSpinner src={Circle} alt="loader" size={'90px'} />
            ) : (
              <CowProtocolLogo size={100} />
            )}
          </ConfirmedIcon>
          <h3>{claimConfirmed ? 'Claimed!' : 'Claiming'}</h3>
          {!claimConfirmed && (
            <p>
              <Trans>{unclaimedAmount} vCOW</Trans>
            </p>
          )}

          {claimConfirmed && (
            <>
              <Trans>
                <h3>You have successfully claimed</h3>
              </Trans>
              <Trans>
                <p>[CLAIMED AMOUNT] vCOW</p>
              </Trans>
              <Trans>
                <span role="img" aria-label="party-hat">
                  🎉🐮{' '}
                </span>
                Welcome to the COWmunnity! :){' '}
                <span role="img" aria-label="party-hat">
                  🐄🎉
                </span>
              </Trans>
            </>
          )}
          {claimAttempting && !claimSubmitted && (
            <AttemptFooter>
              <p>
                <Trans>Confirm this transaction in your wallet</Trans>
              </p>
            </AttemptFooter>
          )}
          {claimAttempting && claimSubmitted && !claimConfirmed && chainId && (
            // && claimTxn?.hash
            <ExternalLink
              // href={getExplorerLink(chainId, claimTxn?.hash, ExplorerDataType.TRANSACTION)}
              href="#"
              style={{ zIndex: 99 }}
            >
              <Trans>View transaction on Explorer</Trans>
            </ExternalLink>
          )}
        </ConfirmOrLoadingWrapper>
      )}
      {/* END -- Try claiming or inform succesfull claim  ----------------------------------------------------- */}

      {/* START -- IS Airdrop + investing (advanced)  ----------------------------------------------------- */}
      {activeClaimAccount && !isAirdropOnly && hasClaims && !isInvestFlowActive && (
        <ClaimBreakdown>
          <h2>vCOW claim breakdown</h2>
          <ClaimTable>
            <table>
              <thead>
                <tr>
                  <th>Select</th>
                  <th>Type of Claim</th>
                  <th>Amount</th>
                  <th>Price</th>
                  <th>Cost</th>
                  <th>Vesting</th>
                  <th>Ends in</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    {' '}
                    <label className="checkAll">
                      <input type="checkbox" name="check" checked disabled />
                    </label>
                  </td>
                  <td>Airdrop</td>
                  <td>
                    <CowProtocolLogo size={16} /> 13,120.50 vCOW
                  </td>
                  <td>-</td>
                  <td>
                    <span className="green">Free!</span>
                  </td>
                  <td>No</td>
                  <td>28 days, 10h, 50m</td>
                </tr>
                <tr>
                  <td>
                    {' '}
                    <label className="checkAll">
                      <input type="checkbox" name="check" />
                    </label>
                  </td>
                  <td>Investment opportunity: Buy vCOW with GNO</td>
                  <td>41,650.78 vCOW</td>
                  <td>16.66 vCoW per GNO</td>
                  <td>2,500.04 GNO</td>
                  <td>4 Years (linear)</td>
                  <td>28 days, 10h, 50m</td>
                </tr>
              </tbody>
            </table>
          </ClaimTable>
        </ClaimBreakdown>
      )}
      {/* END -- IS Airdrop + investing (advanced)  ----------------------------------------------------- */}

      {/* START -- Investing vCOW flow (advanced) ----------------------------------------------------- */}
      {activeClaimAccount && hasClaims && !claimConfirmed && !isAirdropOnly && isInvestFlowActive && (
        <InvestFlow>
          <StepIndicator>
            <h1>
              {isInvestFlowStep === 0
                ? 'Claiming vCOW is a two step process'
                : isInvestFlowStep === 1
                ? 'Set allowance to Buy vCOW'
                : 'Confirm transaction to claim all vCOW'}
            </h1>
            <Steps step={isInvestFlowStep}>
              <li>Allowances: Approve all tokens to be used for investment.</li>
              <li>Submit and confirm the transaction to claim vCOW</li>
            </Steps>
          </StepIndicator>

          {isInvestFlowStep === 1 && (
            <InvestContent>
              <p>
                Your account can participate in the investment of vCOW. Each investment opportunity will allow you to
                invest up to a predefined maximum amount of tokens{' '}
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
                      <i>GNO not approved</i>
                      <button>Approve GNO</button>
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
                      <i>Not needed for ETH!</i>
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

              <InvestFlowValidation>Approve all investment tokens before continuing</InvestFlowValidation>
            </InvestContent>
          )}
        </InvestFlow>
      )}
      {/* END -- Investing vCOW flow (advanced) ----------------------------------------------------- */}

      {/* START -- CLAIM button OR other actions */}
      <FooterNavButtons>
        {/* General claim vCOW button  (no invest) */}
        {activeClaimAccount &&
          hasClaims &&
          (!claimConfirmed || !claimAttempting || !claimSubmitted) &&
          !isInvestFlowActive && (
            <ButtonPrimary onClick={() => (!isAirdropOnly ? setIsInvestFlowActive(true) : setClaimAttempting(true))}>
              <Trans>Claim vCOW</Trans>
            </ButtonPrimary>
          )}
        {/* Check for claims button */}
        {!activeClaimAccount && !hasClaims && (
          <ButtonPrimary
            disabled={!isInputAddressValid}
            type="text"
            onClick={() => setActiveClaimAccount(inputAddress)}
          >
            <Trans>Check claimable vCOW</Trans>
          </ButtonPrimary>
        )}
        {/* Invest flow button */}
        {activeClaimAccount && hasClaims && !claimConfirmed && !isAirdropOnly && isInvestFlowActive && (
          <>
            {isInvestFlowStep === 0 ? (
              <ButtonPrimary onClick={() => setIsInvestFlowStep(1)}>
                <Trans>Approve tokens</Trans>
              </ButtonPrimary>
            ) : isInvestFlowStep === 1 ? (
              <ButtonPrimary onClick={() => setIsInvestFlowStep(2)}>
                <Trans>Review</Trans>
              </ButtonPrimary>
            ) : (
              <ButtonPrimary onClick={() => setIsInvestFlowStep(3)}>
                <Trans>Claim and invest vCOW</Trans>
              </ButtonPrimary>
            )}

            <ButtonSecondary
              onClick={() =>
                isInvestFlowStep === 0 ? setIsInvestFlowActive(false) : setIsInvestFlowStep(isInvestFlowStep - 1)
              }
            >
              <Trans>Go back</Trans>
            </ButtonSecondary>
          </>
        )}
      </FooterNavButtons>
      {/* END -- CLAIM button OR other actions */}
    </PageWrapper>
  )
}

// For yourself or other accounts > Can toggle on/off investing
// Airdrop not uncheckable

// 1. Not connected > Insert address or connect wallet
// 2. Connected > Show claims for connect wallet by default
// 3. Succesful claim > Keep state? Always offer option "Check for another account"
// 4.
