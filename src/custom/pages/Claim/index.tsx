import styled from 'styled-components/macro'
import CowProtocolLogo from 'components/CowProtocolLogo'
import { ButtonPrimary } from 'components/Button'
import { Trans } from '@lingui/macro'
import { ExternalLink } from 'theme'

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

export default function Earn() {
  return (
    <PageWrapper>
      <h1>Claim vCOW token</h1>
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
              <td>13,120.50 vCOW</td>
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
