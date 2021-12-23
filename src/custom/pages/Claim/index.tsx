import styled from 'styled-components/macro'
import CowProtocolLogo from 'components/CowProtocolLogo'
import { ButtonPrimary } from 'components/Button'
import { Trans } from '@lingui/macro'
import { ExternalLink, CustomLightSpinner } from 'theme'
import { isAddress } from 'ethers/lib/utils'
import { CheckCircle } from 'react-feather'
import Circle from 'assets/images/blue-loader.svg'
// import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { useActiveWeb3React } from 'hooks/web3'
import Confetti from 'components/Confetti'

const PageWrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  max-width: 760px;
  width: 100%;
  background: linear-gradient(315deg, #000000 0%, #000000 55%, #202020 100%);
  color: white;
  border-radius: 24px;
  padding: 24px;

  > button {
    background: rgb(237, 104, 52);
    border: 0;
    box-shadow: none;
    color: black;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      margin: 0 auto 24px;
    `};

    &:hover {
      border: 0;
      box-shadow: none;
      transform: none;
      background: rgb(247 127 80);
      color: black;
    }
  }
`

const AvailableClaimTotal = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  padding: 12px;
  border-radius: 12px;
  margin: 0 auto 24px;
  background: rgba(151, 151, 151, 0.1);
`

const IntroDescription = styled.div`
  display: flex;
  width: 100%;
  margin: 0 0 24px;
`

const ClaimTable = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 100%;
  margin: 0 0 24px;

  table {
    display: grid;
    border-collapse: collapse;
    min-width: 100%;
    font-size: 14px;
    grid-template-columns: repeat(7, auto);
  }

  thead,
  tbody,
  tr {
    display: contents;
  }

  th,
  td {
    padding: 15px;
  }

  th {
    position: sticky;
    top: 0;
    background: rgba(151, 151, 151, 0.3);
    text-align: left;
    font-weight: normal;
    font-size: 13px;
    color: white;
    position: relative;
  }

  th:last-child {
    border: 0;
  }

  td {
    padding-top: 10px;
    padding-bottom: 10px;
    color: white;
  }

  tr:nth-child(even) td {
    background: rgba(151, 151, 151, 0.1);
  }
`

const ClaimAccount = styled.div`
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  justify-content: flex-start;
  align-items: center;
  margin: 0 0 24px;

  > div {
    background: grey;
    width: 56px;
    height: 56px;
    border-radius: 56px;
    margin: 0 12px 0 0;
  }

  > span {
    display: flex;
    flex-flow: column wrap;
  }
`

const ConfirmOrLoadingWrapper = styled.div<{ activeBG: boolean }>`
  width: 100%;
  padding: 24px;
  color: white;
  position: relative;
  background: linear-gradient(315deg, #000000 0%, #000000 55%, #202020 100%);
  /* background: ${({ activeBG }) =>
    activeBG &&
    'radial-gradient(76.02% 75.41% at 1.84% 0%, rgba(255, 0, 122, 0.2) 0%, rgba(33, 114, 229, 0.2) 100%), #FFFFFF;'}; */

  h3 {
    font-size: 26px;
    font-weight: 600;
    line-height: 1.2;
    text-align: center;
    margin: 0 0 24px;
    color: white;
  }
`

const AttemptFooter = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;

  > p {
    font-size: 14px;
  }
`

const ConfirmedIcon = styled.div`
  padding: 60px 0;
`

const ContentWrapper = styled.div`
  background: linear-gradient(315deg, #000000 0%, #000000 55%, #202020 100%);
  padding: 32px;
  min-height: 500px;
  height: 100%;
  width: 100%;
  position: relative;
  color: #bbbbbb;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 20px;
    min-height: initial;
  `};

  > button {
    background: rgb(237, 104, 52);
    border: 0;
    box-shadow: none;
    color: black;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      margin: 0 auto 24px;
    `};

    &:hover {
      border: 0;
      box-shadow: none;
      transform: none;
      background: rgb(247 127 80);
      color: black;
    }
  }

  h3 {
    font-size: 26px;
    font-weight: 300;
    line-height: 1.2;
    text-align: center;
    margin: 0 0 24px;
    color: white;

    > b {
      font-weight: 600;
    }
  }

  p {
    font-size: 16px;
    display: block;
    line-height: 1.6;
    font-weight: 300;
    margin: 24px auto;
    text-align: center;
  }

  p > i {
    color: rgb(237, 104, 52);
  }

  p > a {
    display: block;
    margin: 24px 0 0;
    color: rgb(237, 104, 52);
  }
`

const CheckIcon = styled(CheckCircle)`
  height: 16px;
  width: 16px;
  margin-right: 6px;
  stroke: rgb(237, 104, 52);
`

const EligibleBanner = styled.div`
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  display: flex;
  background: rgba(237, 104, 52, 0.1);
  flex-flow: row;
  border: 0.1rem solid rgb(237, 104, 52);
  color: rgb(237, 104, 52);
  justify-content: center;
  align-items: center;
  margin: 0 auto 16px;
`

const TopWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
`

const AmountField = styled.div`
  padding: 18px;
  border-radius: 16px;
  border: 1px solid rgba(151, 151, 151, 0.4);
  background: rgba(151, 151, 151, 0.1);
  width: 100%;
  margin: 0 0 16px;

  > b {
    display: block;
    margin: 0 0 12px;
    font-weight: normal;
    color: #979797;
  }

  > div {
    display: flex;
    width: 100%;
  }

  > div > p {
    display: flex;
    align-items: center;
    margin: 0 0 0 6px;
    padding: 0;
    font-size: 22px;
    font-weight: 600;
    color: white;
  }
`

// Fake states ==================
// const isSelectWallet = true
// const isAirdropOnly = false
// const isInvesting = false

const claimConfirmed = false
const claimAttempting = false
const claimSubmitted = false
// const unclaimedAmount = 1043943922

export default function Claim() {
  const { account, chainId } = useActiveWeb3React()
  return (
    <PageWrapper>
      <h1>Claim vCOW token</h1>
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
      <Confetti start={claimConfirmed} />
      {!claimAttempting && !claimConfirmed && (
        <ContentWrapper>
          <TopWrapper>
            <CowProtocolLogo size={100} />
          </TopWrapper>

          <h3>
            <Trans>
              Claim <b>vCOW</b>
            </Trans>
          </h3>

          <EligibleBanner>
            <CheckIcon />
            <Trans>You are eligible for the airdrop!</Trans>
          </EligibleBanner>

          <AmountField>
            <b>Available to claim</b>
            <div>
              <CowProtocolLogo size={32} />
              <p>120,543.12 vCOW</p>
            </div>
          </AmountField>

          <p>
            <Trans>
              As an important member of the CowSwap Community you may claim vCOW to be used for voting and governance.
              You can claim your tokens until <i>[XX-XX-XXXX - XX:XX GMT]</i>
              <ExternalLink href="https://cow.fi/">Read more about vCOW</ExternalLink>
            </Trans>
          </p>

          <ButtonPrimary
            disabled={!isAddress(account ?? '')}
            padding="16px 16px"
            width="100%"
            $borderRadius="12px"
            mt="1rem"
          >
            <Trans>Claim vCOW</Trans>
          </ButtonPrimary>

          <ExternalLink href="#">Check for another wallet</ExternalLink>
        </ContentWrapper>
      )}
      <AvailableClaimTotal>
        <CowProtocolLogo size={54} />
        <span>
          <b>Total available to claim</b>
          <p>4,320,3234.43 vCOW</p>
        </span>
      </AvailableClaimTotal>
      <IntroDescription>
        Thank you for being a supporter of CowSwap and the CoW protocol. The protocol would like to invite you to become
        part of the COWmunity and share the goals and success. Please proceed below to claim you vCOW token.
      </IntroDescription>
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
      <ButtonPrimary
        // disabled={!isAddress(account ?? '')}
        padding="16px 16px"
        width="100%"
        $borderRadius="12px"
        mt="1rem"
      >
        <Trans>Claim vCOW</Trans>
      </ButtonPrimary>
      <br />
      or
      <br />
      <ExternalLink href="#">Check for another account {' ->'}</ExternalLink>
    </PageWrapper>
  )
}

// For yourself or other accounts > Can toggle on/off investing
// Airdrop not uncheckable

// 1. Not connected > Insert address or connect wallet
// 2. Connected > Show claims for connect wallet by default
// 3. Succesful claim > Keep state? Always offer option "Check for another account"
// 4.
