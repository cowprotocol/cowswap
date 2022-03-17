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
import { MouseoverTooltip, MouseoverTooltipContent } from 'components/Tooltip'
import NotificationBanner from 'components/NotificationBanner'
import { SupportedChainId as ChainId } from 'constants/chains'
import AffiliateStatusCheck from 'components/AffiliateStatusCheck'
import { useHasOrders } from 'api/gnosisProtocol/hooks'
import { Title } from 'components/Page'
import { useTokenBalance } from 'state/wallet/hooks'
import { useVCowData } from 'state/claim/hooks'
import { COW } from 'constants/tokens'

export default function Profile() {
  const referralLink = useReferralLink()
  const { account, chainId } = useActiveWeb3React()
  const { profileData, isLoading, error } = useFetchProfile()
  const { vested, total, unvested, isLoading: isvCowDataloading } = useVCowData()
  const lastUpdated = useTimeAgo(profileData?.lastUpdated)
  const isTradesTooltipVisible = account && chainId == 1 && !!profileData?.totalTrades
  const hasOrders = useHasOrders(account)

  const cowToken = chainId ? COW[chainId] : undefined
  const cowBalance = useTokenBalance(account || undefined, cowToken)

  const renderNotificationMessages = (
    <>
      {error && (
        <NotificationBanner isVisible level="error" canClose={false}>
          There was an error loading your profile data. Please try again later.
        </NotificationBanner>
      )}
      {chainId && chainId !== ChainId.MAINNET && (
        <NotificationBanner isVisible level="info" canClose={false}>
          Profile data is only available for mainnet. Please change the network to see it.
        </NotificationBanner>
      )}
    </>
  )

  const renderTooltipContent = () => (
    <div>
      <div>
        <span>Unvested</span> <span>{formatSmartLocaleAware(unvested, unvested?.currency.decimals) || 0} vCOW</span>
      </div>
      <div>
        <span>Vested</span> <span>{formatSmartLocaleAware(vested, vested?.currency.decimals) || 0} vCOW</span>
      </div>
    </div>
  )

  return (
    <Container>
      {chainId && chainId === ChainId.MAINNET && <AffiliateStatusCheck />}
      <ProfileWrapper>
        {!isvCowDataloading ? (
          <div
            style={{
              display: 'flex',
            }}
          >
            {!total?.equalTo(0) && (
              <div style={{ flex: 1 }}>
                <div>
                  <div>
                    <span>Total vCOW balance</span>
                    <MouseoverTooltip text={renderTooltipContent()}>
                      <HelpCircle size="15" color={'white'} />
                    </MouseoverTooltip>
                  </div>

                  {<h3>{formatSmartLocaleAware(total, total?.currency.decimals)}</h3>}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p>Vested</p>
                    <h5>{formatSmartLocaleAware(vested, vested?.currency.decimals)}</h5>
                  </div>
                  <div>
                    <button disabled={vested?.equalTo(0)}>Covert to COW</button>
                  </div>
                </div>
              </div>
            )}

            <div
              style={{
                flexDirection: 'column',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: 'auto',
                flex: 1,
              }}
            >
              <div>Available COW balance</div>
              <h4>{formatSmartLocaleAware(cowBalance, cowBalance?.currency.decimals) || 0} COW</h4>
            </div>
          </div>
        ) : (
          <div>Loading...</div>
        )}
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
