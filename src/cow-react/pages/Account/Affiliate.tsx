import { SectionTitle } from '@cow/modules/application/pure/Page'
import { Txt } from 'assets/styles/styled'
import { MouseoverTooltipContent } from 'components/Tooltip'
import Web3Status from 'components/Web3Status'
import { getExplorerAddressLink } from 'utils/explorer'
import { shortenAddress } from 'utils'
import Copy from 'components/Copy/CopyMod'
import { RefreshCcw } from 'react-feather'
import AddressSelector from './AddressSelector'
import {
  Wrapper,
  GridWrap,
  CardHead,
  StyledContainer,
  ExtLink,
  ChildWrapper,
  ItemTitle,
  FlexWrap,
  FlexCol,
  Loader,
  TimeFormatted,
} from './styled'
import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { formatInt, formatDecimal } from './utils'
import useReferralLink from 'hooks/useReferralLink'
import { useWeb3React } from '@web3-react/core'
import useFetchProfile from 'hooks/useFetchProfile'
import useTimeAgo from 'hooks/useTimeAgo'
import NotificationBanner from 'components/NotificationBanner'
import { useHasOrders } from '@cow/api/gnosisProtocol/hooks'
import { useAffiliateAddress } from 'state/affiliate/hooks'
import { HelpCircle } from '@cow/common/pure/HelpCircle'

const NotificationMessages = ({ error, chainId }: { error?: unknown; chainId: ChainId }) => (
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

export default function Affiliate() {
  const referralLink = useReferralLink()
  const { account, chainId = ChainId.MAINNET /* , error */ } = useWeb3React()
  const { profileData, isLoading } = useFetchProfile()
  const lastUpdated = useTimeAgo(profileData?.lastUpdated)
  const hasOrders = useHasOrders(account)
  const selectedAddress = useAffiliateAddress()

  const isTradesTooltipVisible = account && chainId === ChainId.MAINNET && !!profileData?.totalTrades

  return (
    <Wrapper>
      <GridWrap>
        <CardHead>
          <SectionTitle>Affiliate Program</SectionTitle>
          {account && (
            <Loader isLoading={isLoading}>
              <StyledContainer>
                <Txt gap={4}>
                  <RefreshCcw size={16} />
                  <Txt gap={4}>Last updated: </Txt>
                  {!lastUpdated ? (
                    '-'
                  ) : (
                    <MouseoverTooltipContent content={<TimeFormatted date={profileData?.lastUpdated} />} wrap>
                      <Txt fontSize={14} fontWeight={600}>
                        {lastUpdated}
                      </Txt>
                    </MouseoverTooltipContent>
                  )}
                  <MouseoverTooltipContent content="Data is updated on the background periodically." wrap>
                    <HelpCircle size={14} />
                  </MouseoverTooltipContent>
                </Txt>
                {hasOrders && (
                  <ExtLink href={getExplorerAddressLink(chainId, account)}>
                    <Txt fontSize={14}>View all orders ↗</Txt>
                  </ExtLink>
                )}
              </StyledContainer>
            </Loader>
          )}
        </CardHead>

        <NotificationMessages /* error={error} */ chainId={chainId} />

        <ChildWrapper>
          <Txt fontSize={16}>
            <strong>Your referral url</strong>
          </Txt>
          <Txt fontSize={14} center>
            {referralLink ? (
              <>
                <span style={{ wordBreak: 'break-all', display: 'inline-block' }}>
                  {referralLink.prefix}
                  {chainId === ChainId.GNOSIS_CHAIN ? (
                    <strong>{shortenAddress(referralLink.address)}</strong>
                  ) : (
                    <AddressSelector address={referralLink.address} />
                  )}

                  <span style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: 8 }}>
                    <Copy
                      toCopy={
                        selectedAddress && chainId !== ChainId.GNOSIS_CHAIN
                          ? `${referralLink.prefix}${selectedAddress}`
                          : referralLink.link
                      }
                    />
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
              Trades
              <MouseoverTooltipContent content="Statistics regarding your own trades." wrap>
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
                  <Txt gap={4}>
                    Total trades
                    {isTradesTooltipVisible && (
                      <MouseoverTooltipContent
                        content="You may see more trades here than what you see in the activity list. To understand why, check out the FAQ."
                        wrap
                      >
                        <HelpCircle size={14} />
                      </MouseoverTooltipContent>
                    )}
                  </Txt>
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
              Referrals
              <MouseoverTooltipContent
                content="Statistics regarding trades by people who used your referral link."
                wrap
              >
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
        {!account && <Web3Status />}
      </GridWrap>
    </Wrapper>
  )
}
