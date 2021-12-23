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
  TopTitle,
  CheckIcon,
  NegativeIcon,
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
} from './styled'

export default function Claim() {
  const { account, chainId } = useActiveWeb3React()

  const dummyIdenticon =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAAAXNSR0IArs4c6QAAA4ZJREFUeF7t3b1xFUEQReF5Jpj4BCC5CoIgiIFoSEAOyoEsZJEAPiaYojAxtWerWlvzye/96T5zb8/MW83t8enuZQ3+fb2/Dd59/tZffoymf90AMAsBACjAKIEUYDT9a1EACjCKIAUYTT8FWGYBZgHDY3D29noAPcAogXqA0fTrAfQAVgItBU+KEAuYzP5iASyABbCASRFiAZPZfwsW8PB8P7sUNVyA3W9/A8DeCABg7/ovAABAD7AzAxRg5+qvxQI2rz8AAGAdYGsG9ABbl18PsHn5AQAAS8F7M6AH2Lv+poGb1x8AAIjrAPXDhm8//6QafP74LsXX4Onnr19W5R4AALMAA4ACJBGjACl9a7GA+LPm6QTG+gNAD6AHSIOIArRZjCZQE5gGoCYwpU8TmP/LFQtgAWkMWgls31aygIQfC2ABw3sZZgFmAUnDWEBKHwtgAbtbQBxAGaB6/+n46uH1+bMF1Aeoewn1/tPxAIi7idMFrPcHAAAqQymeBaT09WAKQAE6ReEKFCAk74xQCkABzuDo8DUowOHUnRNIASjAOSQdvAoFOJi4s8IoAAU4i6VD16EAh9J2XhAFoADn0XTgShTgQNLODKEAFOBMnl59rawA09u50yPo6u8PgFePmf8DADAs4RTg4t8FxAE4fuoYBaAAleEUXxVQD5DSP3/wIwCGTx9nASwgakgLpwAUIBGkB0jp0wOMf9lTJTDW//LvTwEiAZpATWBEqIVXBaQALf8s4OoSGOsPAAC8VIZSfLaAx6e70TeoL3B1AKef/waANADzbiQA4kredAKvrmAUoAkABYj5u3wCKUAk4OoJvPrzs4DNAQYAAKwDFAZYQMneWprA4c00FrA5wAAAgB6gMKAHKNnTA4xvJ7OAzQEGAABaD1CPfYv5X1c/NWz6/bMCAKCdHQyAmAEK0A6epAARwKsrIAAAoAksDFCAeGxaSf6/WD2AHqAylOIpAAVIANXgqoCawFgBCkABIkItnAJc/PTwVv7eBLOAWAEWwAIiQi2cBbCARBALSOlb6/IW8PB8n/4/QP06tybw16f3sYQt/MP33+kCVcLrbxLH/0cQANpSLgAoQFIgCpDStxYLiJ82sQAWkMagJvDiR8ZQAApAAUIGzALMAgI+a5kFpPSZBeSPG/UAeoA0Bs0CzAISQDXYQpCFoMSQzaD4gxIWwALSCKzBV7eAv6T9ww6D8p2HAAAAAElFTkSuQmCC'

  // Fake states ============================
  const [showDemo, setShowDemo] = useState(true)
  const [inputAddress, setInputAddress] = useState('')
  const [isInputAddressValid, setIsInputAddressValid] = useState(false)
  const [activeClaimAccount, setActiveClaimAccount] = useState('')
  const [isAirdropOnly, setIsAirdropOnly] = useState(false)
  const [hasClaims, setHasClaims] = useState(false)
  const [claimConfirmed, setClaimConfirmed] = useState(false)
  const [claimAttempting, setClaimAttempting] = useState(false)
  const [claimSubmitted, setClaimSubmitted] = useState(false)
  const [unclaimedAmount, setUnclaimedAmount] = useState(0)
  const activeClaimAccountENS = 'TestAccount.eth'
  // =========================================

  useEffect(() => {
    setIsInputAddressValid(isAddress(inputAddress))
    setHasClaims(unclaimedAmount > 0 ? true : false)
  }, [inputAddress, unclaimedAmount])

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

      {(!claimAttempting || !claimConfirmed || !claimSubmitted) && activeClaimAccount && hasClaims && (
        <EligibleBanner>
          <CheckIcon />
          <Trans>You are eligible for vCOW token claims!</Trans>
        </EligibleBanner>
      )}

      {/* START -- Top nav buttons */}
      {activeClaimAccount && (
        <TopNav>
          <ClaimAccount hasENS={!!activeClaimAccountENS}>
            <div>
              <img src={dummyIdenticon} alt={activeClaimAccount} />
              <span>
                <p>{activeClaimAccountENS}</p>
                <p>{activeClaimAccount}</p>
              </span>
            </div>
            <ButtonSecondary onClick={() => setActiveClaimAccount('')}>Change account</ButtonSecondary>
          </ClaimAccount>
        </TopNav>
      )}
      {/* END -- Top nav buttons */}

      {/* START - Show general title OR total to claim (user has airdrop or airdrop+investment) --------------------------- */}
      {(!claimAttempting || !claimConfirmed || !claimSubmitted) && (
        <ClaimSummary>
          <CowProtocolLogo size={100} />
          {!activeClaimAccount && !hasClaims && (!claimAttempting || !claimConfirmed) && (
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
      {!activeClaimAccount && (
        <CheckAddress>
          <p>
            Enter an address to check for any eligible vCOW claims{' '}
            <ExternalLink href="#">
              <Trans>or connect a wallet</Trans>
            </ExternalLink>
          </p>
          <InputField>
            <b>Input address</b>
            <input
              placeholder="Address or ENS name"
              value={inputAddress}
              onChange={(e) => setInputAddress(e.currentTarget.value)}
            />
          </InputField>
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
      {/* END -- IS Airdrop only (simple)  ----------------------------------------------------- */}

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
      {/* END -- NO CLAIMS  ----------------------------------------------------- */}

      {/* START - Try claiming or inform succesfull claim  ----------------------------------------------------- */}
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
                <span role="img" aria-label="party-hat">
                  🎉🐮{' '}
                </span>
                Welcome to team COW :){' '}
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
      {activeClaimAccount && !isAirdropOnly && hasClaims && (
        <ClaimBreakdown>
          <h2>vCOW claim breakdown</h2>
          <ClaimTable>
            <table>
              <thead>
                <tr>
                  <th>
                    <label className="checkAll">
                      <input type="checkbox" name="check" />
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

      {/* START -- CLAIM button OR other actions */}
      <FooterNavButtons>
        {activeClaimAccount && hasClaims && (
          <ButtonPrimary>
            <Trans>Claim vCOW</Trans>
          </ButtonPrimary>
        )}
        {!activeClaimAccount && !hasClaims && (
          <ButtonPrimary disabled={!isInputAddressValid} type="text">
            <Trans>Check claimable vCOW</Trans>
          </ButtonPrimary>
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
