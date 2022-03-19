import { Txt } from 'assets/styles/styled'
import {
  FlexCol,
  FlexWrap,
  Wrapper,
  Container,
  GridWrap,
  CardHead,
  StyledContainer,
  StyledTime,
  ItemTitle,
  ChildWrapper,
  Loader,
  ExtLink,
  ProfileWrapper,
  ProfileGridWrap,
} from 'pages/Profile/styled'
import { useActiveWeb3React } from 'hooks/web3'
import Copy from 'components/Copy/CopyMod'
import { HelpCircle, RefreshCcw } from 'react-feather'
import Web3Status from 'components/Web3Status'
import useReferralLink from 'hooks/useReferralLink'
import useFetchProfile from 'hooks/useFetchProfile'
import { formatSmartLocaleAware, numberFormatter } from 'utils/format'
import { getExplorerAddressLink } from 'utils/explorer'
import useTimeAgo from 'hooks/useTimeAgo'
import { MouseoverTooltipContent } from 'components/Tooltip'
import NotificationBanner from 'components/NotificationBanner'
import { SupportedChainId as ChainId } from 'constants/chains'
import AffiliateStatusCheck from 'components/AffiliateStatusCheck'
import { useHasOrders } from 'api/gnosisProtocol/hooks'
import { Title } from 'components/Page'
import { useTokenBalance } from 'state/wallet/hooks'
import { useVCowData } from 'state/claim/hooks'
import { V_COW, COW } from 'constants/tokens'
import VCOWDropdown from './VCOWDropdown'
import { isPr, isLocal } from 'utils/environments'
import { IS_CLAIMING_ENABLED } from 'pages/Claim/const'

export default function Profile() {
  const referralLink = useReferralLink()
  const { account, chainId } = useActiveWeb3React()
  const { profileData, isLoading, error } = useFetchProfile()
  const lastUpdated = useTimeAgo(profileData?.lastUpdated)
  const isTradesTooltipVisible = account && chainId == 1 && !!profileData?.totalTrades
  const hasOrders = useHasOrders(account)

  const vCowBalance = useTokenBalance(account || undefined, chainId ? V_COW[chainId] : undefined)
  const cowBalance = useTokenBalance(account || undefined, chainId ? COW[chainId] : undefined)

  const { vested, total, unvested } = useVCowData()

  // TODO: remove once this is not needed anymore
  if (isPr || isLocal) {
    console.force.log('vested', formatSmartLocaleAware(vested, vested?.currency.decimals))
    console.force.log('total', formatSmartLocaleAware(total, total?.currency.decimals))
    console.force.log('unvested', formatSmartLocaleAware(unvested, unvested?.currency.decimals))
    console.force.log('cowBalance', formatSmartLocaleAware(cowBalance, cowBalance?.currency.decimals))
  }

  const renderNotificationMessages = (
    <>
      {error && (
        <NotificationBanner isVisible level="error" canClose={false}>
          There was an error loading your profile data. Please try again later.
        </NotificationBanner>
      )}
      {chainId && chainId !== ChainId.MAINNET && (
        <NotificationBanner isVisible level="info" canClose={false}>
          Affiliate data is only available for Ethereum. Please change the network to see it.
        </NotificationBanner>
      )}
    </>
  )

  return (
    <Container>
      {chainId && chainId === ChainId.MAINNET && <AffiliateStatusCheck />}
      <ProfileWrapper>
        <ProfileGridWrap horizontal>
          <CardHead>
            <Title>Profile</Title>
          </CardHead>
          {IS_CLAIMING_ENABLED && vCowBalance && <VCOWDropdown balance={vCowBalance} />}
        </ProfileGridWrap>
      </ProfileWrapper>
      <Wrapper>
        <GridWrap>
          <CardHead>
            <Title>Affiliate Program</Title>
            {account && (
              <Loader isLoading={isLoading}>
                <StyledContainer>
                  <Txt>
                    <RefreshCcw size={16} />
                    &nbsp;&nbsp;
                    <Txt secondary>
                      Last updated
                      <MouseoverTooltipContent content="Data is updated on the background periodically.">
                        <HelpCircle size={14} />
                      </MouseoverTooltipContent>
                      :&nbsp;
                    </Txt>
                    {!lastUpdated ? (
                      '-'
                    ) : (
                      <MouseoverTooltipContent content={<TimeFormatted date={profileData?.lastUpdated} />}>
                        <strong>{lastUpdated}</strong>
                      </MouseoverTooltipContent>
                    )}
                  </Txt>
                  {hasOrders && (
                    <ExtLink href={getExplorerAddressLink(chainId || 1, account)}>
                      <Txt secondary>View all orders ↗</Txt>
                    </ExtLink>
                  )}
                </StyledContainer>
              </Loader>
            )}
          </CardHead>
          {renderNotificationMessages}
          <ChildWrapper>
            <Txt fs={16}>
              <strong>Your referral url</strong>
            </Txt>
            <Txt fs={14} center>
              {referralLink ? (
                <>
                  <span style={{ wordBreak: 'break-all', display: 'inline-block' }}>
                    {referralLink.prefix}
                    <strong>{referralLink.address}</strong>
                    <span style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: 8 }}>
                      <Copy toCopy={referralLink.link} />
                    </span>
                  </span>
                </>
              ) : (
                '-'
              )}
            </Txt>
          </ChildWrapper>
          <GridWrap horizontal>
            <ChildWrapper>
              <ItemTitle>
                Trades&nbsp;
                <MouseoverTooltipContent content="Statistics regarding your own trades.">
                  <HelpCircle size={14} />
                </MouseoverTooltipContent>
              </ItemTitle>
              <FlexWrap className="item">
                <FlexCol>
                  <span role="img" aria-label="farmer">
                    🧑‍🌾
                  </span>
                  <Loader isLoading={isLoading}>
                    <strong>{formatInt(profileData?.totalTrades)}</strong>
                  </Loader>
                  <Loader isLoading={isLoading}>
                    <span>
                      Total trades
                      {isTradesTooltipVisible && (
                        <MouseoverTooltipContent content="You may see more trades here than what you see in the activity list. To understand why, check out the FAQ.">
                          <HelpCircle size={14} />
                        </MouseoverTooltipContent>
                      )}
                    </span>
                  </Loader>
                </FlexCol>
                <FlexCol>
                  <span role="img" aria-label="moneybag">
                    💰
                  </span>
                  <Loader isLoading={isLoading}>
                    <strong>{formatDecimal(profileData?.tradeVolumeUsd)}</strong>
                  </Loader>
                  <Loader isLoading={isLoading}>
                    <span>Total traded volume</span>
                  </Loader>
                </FlexCol>
              </FlexWrap>
            </ChildWrapper>
            <ChildWrapper>
              <ItemTitle>
                Referrals&nbsp;
                <MouseoverTooltipContent content="Statistics regarding trades by people who used your referral link.">
                  <HelpCircle size={14} />
                </MouseoverTooltipContent>
              </ItemTitle>
              <FlexWrap className="item">
                <FlexCol>
                  <span role="img" aria-label="handshake">
                    🤝
                  </span>
                  <Loader isLoading={isLoading}>
                    <strong>{formatInt(profileData?.totalReferrals)}</strong>
                  </Loader>
                  <Loader isLoading={isLoading}>
                    <span>Total referrals</span>
                  </Loader>
                </FlexCol>
                <FlexCol>
                  <span role="img" aria-label="wingedmoney">
                    💸
                  </span>
                  <Loader isLoading={isLoading}>
                    <strong>{formatDecimal(profileData?.referralVolumeUsd)}</strong>
                  </Loader>
                  <Loader isLoading={isLoading}>
                    <span>Referrals volume</span>
                  </Loader>
                </FlexCol>
              </FlexWrap>
            </ChildWrapper>
          </GridWrap>
          {!account && <Web3Status openOrdersPanel={() => console.log('TODO')} />}
        </GridWrap>
      </Wrapper>
    </Container>
  )
}

interface TimeProps {
  date: string | undefined
}

const TimeFormatted = ({ date }: TimeProps) => {
  if (!date) return null

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  const _date = new Date(date)
  const monthName = months[_date.getMonth()]
  const hours = _date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })

  return <StyledTime>{`${_date.getDate()} ${monthName} ${_date.getFullYear()} - ${hours}`}</StyledTime>
}

const formatDecimal = (number?: number): string => {
  return number ? numberFormatter.format(number) : '-'
}

const formatInt = (number?: number): string => {
  return number ? number.toLocaleString() : '-'
}
