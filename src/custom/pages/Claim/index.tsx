import { useState } from 'react'
import CowProtocolLogo from 'components/CowProtocolLogo'
import { ButtonPrimary } from 'components/Button'
import { Trans } from '@lingui/macro'
import { ExternalLink, CustomLightSpinner } from 'theme'
import { isAddress } from 'ethers/lib/utils'
import Circle from 'assets/images/blue-loader.svg'
// import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { useActiveWeb3React } from 'hooks/web3'
import Confetti from 'components/Confetti'
import {
  Demo,
  PageWrapper,
  ConfirmOrLoadingWrapper,
  ConfirmedIcon,
  AttemptFooter,
  ContentWrapper,
  TopTitle,
  CheckIcon,
  AvailableClaimTotal,
  ClaimSummary,
  IntroDescription,
  ClaimTable,
  ClaimAccount,
  EligibleBanner,
  InputField,
  CheckAddress,
  ClaimBreakdown,
  FooterNavButtons,
} from './styled'

export default function Claim() {
  const { account, chainId } = useActiveWeb3React()

  // Fake states ============================
  const [activeClaimAccount, setActiveClaimAccount] = useState('')
  const [isAirdropOnly, setIsAirdropOnly] = useState(false)
  const [hasClaims, setHasClaims] = useState(false)
  const [claimConfirmed, setClaimConfirmed] = useState(false)
  const [claimAttempting, setClaimAttempting] = useState(false)
  const [claimSubmitted, setClaimSubmitted] = useState(false)
  const [unclaimedAmount, setUnclaimedAmount] = useState(0)
  // =========================================

  return (
    <PageWrapper>
      {/* DEMO ONLY */}
      <Demo>
        <table>
          <tbody>
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
                <button onClick={() => setClaimAttempting(!claimAttempting)}>Toggle ({String(claimAttempting)})</button>
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
      {/* DEMO ONLY */}
      {/* If claim is confirmed > trigger confetti effect */}
      <Confetti start={claimConfirmed} />

      {/* START - Show title IF inputting address OR is simple airdrop claim */}
      <TopTitle titleOnly={!!activeClaimAccount}>
        {!activeClaimAccount && <CowProtocolLogo size={100} />}
        <h1>
          <Trans>
            Claim <b>vCOW</b> token
          </Trans>
        </h1>
      </TopTitle>
      {/* END - Show title IF inputting address OR is simple airdrop claim */}

      {/* START - Get address/ENS (user not connected yet or opted for checking 'another' account) */}
      {!activeClaimAccount && (
        <CheckAddress>
          <p>Enter an address to check for any eligible vCOW claims.</p>
          <InputField>
            <b>Input address</b>
            <input placeholder="Address or ENS name" />
          </InputField>
        </CheckAddress>
      )}
      {/* END - Get address/ENS (user not connected yet or opted for checking 'another' account) */}

      {/* START - Show total to claim (user has airdrop or airdrop+investment) --------------------------- */}
      {activeClaimAccount && hasClaims && (
        <AvailableClaimTotal>
          <EligibleBanner>
            <CheckIcon />
            <Trans>You are eligible for vCOW token claims!</Trans>
          </EligibleBanner>
          <ClaimSummary>
            <CowProtocolLogo size={54} />
            <span>
              <b>Total available to claim</b>
              <p>4,320,3234.43 vCOW</p>
            </span>
          </ClaimSummary>
        </AvailableClaimTotal>
      )}
      {/* END - Show total to claim (user has airdrop or airdrop+investment) --------------------------- */}

      {/* START -- IS Airdrop only (simple)  ----------------------------------------------------- */}
      {activeClaimAccount && isAirdropOnly && !claimAttempting && !claimConfirmed && (
        <IntroDescription>
          <Trans>
            Thank you for being a supporter of CowSwap and the CoW protocol. As an important member of the CowSwap
            Community you may claim vCOW to be used for voting and governance. You can claim your tokens until{' '}
            <i>[XX-XX-XXXX - XX:XX GMT]</i>
            <ExternalLink href="https://cow.fi/">Read more about vCOW</ExternalLink>
          </Trans>
        </IntroDescription>
      )}
      {/* END -- IS Airdrop only (simple)  ----------------------------------------------------- */}
      {/* START - Try claiming or inform succesfull claim  ----------------------------------------------------- */}
      {claimAttempting && claimConfirmed && (
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
              {/* <Trans>{unclaimedAmount?.toFixed(0, { groupSeparator: ',' } ?? '-')} vCOW</Trans> */}
              <Trans>500 vCOW</Trans>
            </p>
          )}

          {claimConfirmed && (
            <>
              <Trans>
                <span role="img" aria-label="party-hat">
                  🎉{' '}
                </span>
                Welcome to team Unicorn :){' '}
                <span role="img" aria-label="party-hat">
                  🎉
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
            <ClaimAccount>
              {/* [account web3 profile image OR identicon] */}
              <div></div>
              <span>
                <b>
                  supercow.eth <span>(Connected account)</span>
                </b>
                <i>0x00000000000000001</i>
              </span>
            </ClaimAccount>
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
      {/* START -- CLAIM button OR reset/check for another account */}
      <FooterNavButtons>
        {activeClaimAccount && (
          <>
            {hasClaims && (
              <ButtonPrimary padding="16px 16px" width="100%" $borderRadius="12px" mt="1rem">
                <Trans>Claim vCOW</Trans>
              </ButtonPrimary>
            )}
            <ExternalLink href="#">Check for another account {' ->'}</ExternalLink>
          </>
        )}
      </FooterNavButtons>
      {/* END -- CLAIM button OR reset/check for another account */}
    </PageWrapper>
  )
}

// For yourself or other accounts > Can toggle on/off investing
// Airdrop not uncheckable

// 1. Not connected > Insert address or connect wallet
// 2. Connected > Show claims for connect wallet by default
// 3. Succesful claim > Keep state? Always offer option "Check for another account"
// 4.
