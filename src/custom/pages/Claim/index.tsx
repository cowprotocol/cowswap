/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useMemo } from 'react'
import { Trans } from '@lingui/macro'
import { useActiveWeb3React } from 'hooks/web3'
import { ExternalLink, CustomLightSpinner } from 'theme'
import {
  useUserAvailableClaims,
  useUserUnclaimedAmount,
  FREE_CLAIM_TYPES,
  ClaimType,
  useClaimCallback,
  useInvestmentStillAvailable,
  useAirdropStillAvailable,
} from 'state/claim/hooks'
import { ButtonPrimary, ButtonSecondary } from 'components/Button'
import Circle from 'assets/images/blue-loader.svg'
import {
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
  InvestTokenSubtotal,
  StepIndicator,
  Steps,
  TokenLogo,
  ClaimSummaryTitle,
  InputErrorText,
  InputFieldTitle,
  ClaimAccountButtons,
} from 'pages/Claim/styled'
import {
  getTypeToCurrencyMap,
  getTypeToPriceMap,
  isFreeClaim,
  getFreeClaims,
  hasPaidClaim,
  parseClaimAmount,
  getIndexes,
  getPaidClaims,
} from 'state/claim/hooks/utils'
import { useWalletModalToggle } from 'state/application/hooks'
import CowProtocolLogo from 'components/CowProtocolLogo'
import Confetti from 'components/Confetti'
import { shortenAddress } from 'utils'
import { isAddress } from 'web3-utils'
import useENS from 'hooks/useENS'
import { TYPE } from 'theme'
import { formatSmart } from 'utils/format'

export default function Claim() {
  const { account, chainId } = useActiveWeb3React()

  // address/ens address
  const [inputAddress, setInputAddress] = useState<string>('')

  const { loading, address: resolvedAddress, name: resolvedENS } = useENS(inputAddress)
  const isInputAddressValid = useMemo(() => isAddress(resolvedAddress || ''), [resolvedAddress])

  // Show input error
  const showInputError = useMemo(
    () => Boolean(inputAddress.length > 0 && !loading && !resolvedAddress),
    [resolvedAddress, inputAddress, loading]
  )

  // account
  const [activeClaimAccount, setActiveClaimAccount] = useState<string>('')
  const [activeClaimAccountENS, setActiveClaimAccountENS] = useState<string>('')

  // check address
  const [isSearchUsed, setIsSearchUsed] = useState<boolean>(false)

  // claiming
  const [claimConfirmed, setClaimConfirmed] = useState<boolean>(false)
  const [claimAttempting, setClaimAttempting] = useState<boolean>(false)
  const [claimSubmitted, setClaimSubmitted] = useState<boolean>(false)
  const [claimedAmount, setClaimedAmount] = useState<number>(0)

  // investment
  const [isInvestFlowActive, setIsInvestFlowActive] = useState<boolean>(false)
  const [isInvestFlowStep, setIsInvestFlowStep] = useState<number>(0)

  // should be updated
  const dummyIdenticon =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAAAXNSR0IArs4c6QAAA4ZJREFUeF7t3b1xFUEQReF5Jpj4BCC5CoIgiIFoSEAOyoEsZJEAPiaYojAxtWerWlvzye/96T5zb8/MW83t8enuZQ3+fb2/Dd59/tZffoymf90AMAsBACjAKIEUYDT9a1EACjCKIAUYTT8FWGYBZgHDY3D29noAPcAogXqA0fTrAfQAVgItBU+KEAuYzP5iASyABbCASRFiAZPZfwsW8PB8P7sUNVyA3W9/A8DeCABg7/ovAABAD7AzAxRg5+qvxQI2rz8AAGAdYGsG9ABbl18PsHn5AQAAS8F7M6AH2Lv+poGb1x8AAIjrAPXDhm8//6QafP74LsXX4Onnr19W5R4AALMAA4ACJBGjACl9a7GA+LPm6QTG+gNAD6AHSIOIArRZjCZQE5gGoCYwpU8TmP/LFQtgAWkMWgls31aygIQfC2ABw3sZZgFmAUnDWEBKHwtgAbtbQBxAGaB6/+n46uH1+bMF1Aeoewn1/tPxAIi7idMFrPcHAAAqQymeBaT09WAKQAE6ReEKFCAk74xQCkABzuDo8DUowOHUnRNIASjAOSQdvAoFOJi4s8IoAAU4i6VD16EAh9J2XhAFoADn0XTgShTgQNLODKEAFOBMnl59rawA09u50yPo6u8PgFePmf8DADAs4RTg4t8FxAE4fuoYBaAAleEUXxVQD5DSP3/wIwCGTx9nASwgakgLpwAUIBGkB0jp0wOMf9lTJTDW//LvTwEiAZpATWBEqIVXBaQALf8s4OoSGOsPAAC8VIZSfLaAx6e70TeoL3B1AKef/waANADzbiQA4kredAKvrmAUoAkABYj5u3wCKUAk4OoJvPrzs4DNAQYAAKwDFAZYQMneWprA4c00FrA5wAAAgB6gMKAHKNnTA4xvJ7OAzQEGAABaD1CPfYv5X1c/NWz6/bMCAKCdHQyAmAEK0A6epAARwKsrIAAAoAksDFCAeGxaSf6/WD2AHqAylOIpAAVIANXgqoCawFgBCkABIkItnAJc/PTwVv7eBLOAWAEWwAIiQi2cBbCARBALSOlb6/IW8PB8n/4/QP06tybw16f3sYQt/MP33+kCVcLrbxLH/0cQANpSLgAoQFIgCpDStxYLiJ82sQAWkMagJvDiR8ZQAApAAUIGzALMAgI+a5kFpPSZBeSPG/UAeoA0Bs0CzAISQDXYQpCFoMSQzaD4gxIWwALSCKzBV7eAv6T9ww6D8p2HAAAAAElFTkSuQmCC'

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle()

  // get user claim data
  const userClaimData = useUserAvailableClaims(activeClaimAccount)
  const sortedClaimData = useMemo(
    () => userClaimData.sort((a, b) => +FREE_CLAIM_TYPES.includes(b.type) - +FREE_CLAIM_TYPES.includes(a.type)),
    [userClaimData]
  )

  // get total unclaimed ammount
  const unclaimedAmount = useUserUnclaimedAmount(activeClaimAccount)

  const hasClaims = useMemo(() => userClaimData.length > 0, [userClaimData])
  const isAirdropOnly = useMemo(() => !hasPaidClaim(userClaimData), [userClaimData])

  // handle table select change
  const [selected, setSelected] = useState<number[]>([])
  const [selectedAll, setSelectedAll] = useState<boolean>(false)

  // claim type to currency and price map
  const typeToCurrencyMap = useMemo(() => getTypeToCurrencyMap(chainId), [chainId])
  const typeToPriceMap = useMemo(() => getTypeToPriceMap(), [])

  // checks regarding investment time window
  const isInvestmentStillAvailable = useInvestmentStillAvailable()
  const isAirdropStillAvailable = useAirdropStillAvailable()

  // claim callback
  const { claimCallback } = useClaimCallback(activeClaimAccount)

  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const checked = event.target.checked
    const output = [...selected]
    checked ? output.push(index) : output.splice(output.indexOf(index), 1)
    setSelected(output)

    if (!checked) {
      setSelectedAll(false)
    }
  }

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked
    const paid = getIndexes(getPaidClaims(userClaimData))
    setSelected(checked ? paid : [])
    setSelectedAll(checked)
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value
    const withoutSpaces = input.replace(/\s+/g, '')
    setInputAddress(withoutSpaces)
  }

  // handle change account
  const handleChangeAccount = () => {
    setActiveClaimAccount('')
    setSelected([])
    setClaimSubmitted(false)
    setClaimConfirmed(false)
    setIsSearchUsed(true)
  }

  // check claim
  const handleCheckClaim = () => {
    setActiveClaimAccount(resolvedAddress || '')
    setActiveClaimAccountENS(resolvedENS || '')
    setInputAddress('')
  }

  // handle submit claim
  const handleSubmitClaim = () => {
    // just to be sure
    if (!activeClaimAccount) return

    const freeClaims = getFreeClaims(userClaimData)

    // check if there are any selected (paid) claims
    if (!selected.length) {
      const inputData = freeClaims.map(({ index }) => ({ index }))

      console.log('starting claiming with', inputData)

      setClaimAttempting(true)

      claimCallback(inputData)
        .then((res) => {
          // this is not right currently
          setClaimSubmitted(true)
          setClaimConfirmed(true)
        })
        .catch((error) => {
          console.log(error)
        })
        .finally(() => {
          setClaimAttempting(false)
        })
    } else {
      const inputData = [...getIndexes(freeClaims), ...selected].map((idx: number) => {
        return userClaimData.find(({ index }) => idx === index)
      })
      console.log('starting investment flow', inputData)
      setIsInvestFlowActive(true)
    }
  }
  console.log(
    `Claim/index::`,
    `[unclaimedAmount ${unclaimedAmount?.toFixed(2)}]`,
    `[hasClaims ${hasClaims}]`,
    `[activeClaimAccount ${activeClaimAccount}]`,
    `[isAirdropOnly ${isAirdropOnly}]`,
    `[isInvestmentStillAvailable ${isInvestmentStillAvailable}]`,
    `[isAirdropStillAvailable ${isAirdropStillAvailable}]`
  )

  // on account change
  useEffect(() => {
    if (!isSearchUsed) {
      setActiveClaimAccount(account || '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account])

  // if wallet is disconnected
  useEffect(() => {
    if (!account && !isSearchUsed) {
      setActiveClaimAccount('')
    }

    if (!account) {
      setIsInvestFlowActive(false)
      setIsInvestFlowStep(0)
    }
  }, [account, isSearchUsed])

  return (
    <PageWrapper>
      {/* If claim is confirmed > trigger confetti effect */}
      <Confetti start={claimConfirmed} />
      {/* START -- Top nav buttons */}
      {!!activeClaimAccount && (
        <TopNav>
          <ClaimAccount>
            <div>
              <img src={dummyIdenticon} alt={activeClaimAccount} />
              <p>{activeClaimAccountENS ? activeClaimAccountENS : shortenAddress(activeClaimAccount)}</p>
            </div>

            <ClaimAccountButtons>
              {!!account && account !== activeClaimAccount && (
                <ButtonSecondary disabled={claimAttempting} onClick={() => setActiveClaimAccount(account)}>
                  Your claims
                </ButtonSecondary>
              )}

              <ButtonSecondary disabled={claimAttempting} onClick={handleChangeAccount}>
                Change account
              </ButtonSecondary>
            </ClaimAccountButtons>
          </ClaimAccount>
        </TopNav>
      )}
      {/* END -- Top nav buttons */}

      {/* START - Show general title OR total to claim (user has airdrop or airdrop+investment) --------------------------- */}
      {!claimAttempting &&
        !claimConfirmed &&
        !claimSubmitted &&
        !!activeClaimAccount &&
        !!hasClaims &&
        !isInvestFlowActive && (
          <EligibleBanner>
            <CheckIcon />
            <Trans>This account is eligible for vCOW token claims!</Trans>
          </EligibleBanner>
        )}
      {!claimAttempting && !claimConfirmed && !claimSubmitted && !isInvestFlowActive && (
        <ClaimSummary>
          <CowProtocolLogo size={100} />
          {!activeClaimAccount && !hasClaims && (
            <ClaimSummaryTitle>
              <Trans>
                Claim <b>vCOW</b> token
              </Trans>
            </ClaimSummaryTitle>
          )}
          {activeClaimAccount && (
            <div>
              <ClaimTotal>
                <b>Total available to claim</b>
                <p>{formatSmart(unclaimedAmount)} vCOW</p>
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
            Enter an address to check for any eligible vCOW claims. <br />
            <i>Note: It is possible to claim for an account, using any wallet/account.</i>
            {!account && (
              <ButtonSecondary onClick={toggleWalletModal}>
                <Trans>or connect a wallet</Trans>
              </ButtonSecondary>
            )}
          </p>

          <InputField>
            <InputFieldTitle>
              <b>Input address</b>
              {loading && <CustomLightSpinner src={Circle} alt="loader" size={'10px'} />}
            </InputFieldTitle>
            <input placeholder="Address or ENS name" value={inputAddress} onChange={handleInputChange} />
          </InputField>

          {showInputError && (
            <InputErrorText>
              <TYPE.error error={true}>
                <Trans>Enter valid token address or ENS</Trans>
              </TYPE.error>
            </InputErrorText>
          )}
        </CheckAddress>
      )}
      {/* END - Get address/ENS (user not connected yet or opted for checking 'another' account) */}

      {/* START -- IS Airdrop only (simple)  ----------------------------------------------------- */}
      {!!activeClaimAccount && !!hasClaims && !!isAirdropOnly && !claimAttempting && !claimConfirmed && (
        <>
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

          {/* TODO: this is temporary to show the flag, find a better way to show it */}
          {!isAirdropStillAvailable && <h3>WARNING: investment window is over!!!</h3>}
        </>
      )}
      {/* END -- IS Airdrop only (simple)  ---------------------------------------- */}

      {/* START -- NO CLAIMS  ----------------------------------------------------- */}
      {!!activeClaimAccount && !hasClaims && !claimAttempting && !claimConfirmed && (
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
          {!claimConfirmed && <Trans>{formatSmart(unclaimedAmount)} vCOW</Trans>}

          {claimConfirmed && (
            <>
              <Trans>
                <h3>You have successfully claimed</h3>
              </Trans>
              <Trans>
                <p>{claimedAmount} vCOW</p>
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
          {claimAttempting && !claimSubmitted && !claimConfirmed && (
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
      {!!activeClaimAccount &&
        !isAirdropOnly &&
        !!hasClaims &&
        !isInvestFlowActive &&
        !(claimAttempting || claimConfirmed) && (
          <ClaimBreakdown>
            <h2>vCOW claim breakdown</h2>

            {/* TODO: this is temporary to show the flag, find a better way to show it */}
            {!isInvestmentStillAvailable && <h3>WARNING: investment window is over!!!</h3>}

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
                    <th>Price</th>
                    <th>Cost</th>
                    <th>Vesting</th>
                    <th>Ends in</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedClaimData.map(({ index, type, amount }) => {
                    const isFree = isFreeClaim(type)
                    const currency = typeToCurrencyMap[type] || ''
                    const vCowPrice = typeToPriceMap[type]
                    const parsedAmount = parseClaimAmount(amount, chainId)
                    const cost = vCowPrice * Number(parsedAmount?.toSignificant(6))

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
                        <td>{isFree ? type : `Buy vCOW with ${currency}`}</td>
                        <td width="150px">
                          <CowProtocolLogo size={16} /> {parsedAmount?.toFixed(0, { groupSeparator: ',' })} vCOW
                        </td>
                        <td>{isFree ? '-' : `${vCowPrice} vCoW per ${currency}`}</td>
                        <td>{isFree ? <span className="green">Free!</span> : `${cost} ${currency}`}</td>
                        <td>{type === ClaimType.Airdrop ? 'No' : '4 years (linear)'}</td>
                        <td>28 days, 10h, 50m</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </ClaimTable>
          </ClaimBreakdown>
        )}
      {/* END -- IS Airdrop + investing (advanced)  ----------------------------------------------------- */}

      {/* START -- Investing vCOW flow (advanced) ----------------------------------------------------- */}
      {!!activeClaimAccount && !!hasClaims && !claimConfirmed && !isAirdropOnly && !!isInvestFlowActive && (
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

          {/* Invest flow: Step 1 > Set allowances and investment amounts */}
          {isInvestFlowStep === 1 ? (
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

              <InvestTokenSubtotal>
                {activeClaimAccount} will receive: 4,054,671.28 vCOW based on investment(s)
              </InvestTokenSubtotal>

              <InvestFlowValidation>Approve all investment tokens before continuing</InvestFlowValidation>
            </InvestContent>
          ) : null}

          {/* Invest flow: Step 2 > Review summary */}
          {isInvestFlowStep === 2 ? (
            <InvestContent>
              1. Claim airdrop: {activeClaimAccount} receives 13,120.50 vCOW (Note: please make sure you intend to claim
              and send vCOW to the mentioned account)
              <br />
              <br />
              2. Claim and invest: Investing with account: {account} (connected account). Investing: 1343 GNO (50% of
              available investing opportunity) and 32 ETH (30% of available investing opportunity)
              <br />
              <br />
              3. Receive vCOW claims on account {activeClaimAccount}: 23,947.6 vCOW - available NOW! and 120,567.12 vCOW
              - Vested linearly 4 years <br />
              <br />
              <br />
              <h4>Ready to claim your vCOW?</h4>
              <p>
                <b>What will happen?</b> By sending this Ethereum transaction, you will be investing tokens from the
                connected account and exchanging them for vCOW tokens that will be received by the claiming account
                specified above.
              </p>
              <p>
                <b>Can I modify the invested amounts or invest partial amounts later?</b> No. Once you send the
                transaction, you cannot increase or reduce the investment. Investment oportunities can only be exercised
                once.
              </p>
            </InvestContent>
          ) : null}
        </InvestFlow>
      )}
      {/* END -- Investing vCOW flow (advanced) ----------------------------------------------------- */}

      {/* START -- CLAIM button OR other actions */}
      <FooterNavButtons>
        {/* General claim vCOW button  (no invest) */}
        {!!activeClaimAccount && !!hasClaims && !isInvestFlowActive && !claimAttempting && !claimConfirmed ? (
          account ? (
            <ButtonPrimary onClick={handleSubmitClaim}>
              <Trans>Claim vCOW</Trans>
            </ButtonPrimary>
          ) : (
            <ButtonPrimary onClick={toggleWalletModal}>
              <Trans>Connect a wallet</Trans>
            </ButtonPrimary>
          )
        ) : null}

        {/* Check for claims button */}
        {(!activeClaimAccount || !hasClaims) && (
          <ButtonPrimary disabled={!isInputAddressValid} type="text" onClick={handleCheckClaim}>
            <Trans>Check claimable vCOW</Trans>
          </ButtonPrimary>
        )}

        {/* Invest flow button */}
        {!!activeClaimAccount && !!hasClaims && !claimConfirmed && !isAirdropOnly && !!isInvestFlowActive && (
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
