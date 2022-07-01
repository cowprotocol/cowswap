import { useCallback, useEffect, useMemo, useState } from 'react'
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
  CardsWrapper,
  Card,
  CardActions,
  BannerCard,
  BalanceDisplay,
  ConvertWrapper,
  VestingBreakdown,
  BannerCardContent,
  BannerCardSvg,
  CardsLoader,
  CardsSpinner,
} from '@src/custom/pages/Account/styled'
import { useActiveWeb3React } from 'hooks/web3'
import Copy from 'components/Copy/CopyMod'
import { RefreshCcw } from 'react-feather'
import Web3Status from 'components/Web3Status'
import useReferralLink from 'hooks/useReferralLink'
import useFetchProfile from 'hooks/useFetchProfile'
import { getBlockExplorerUrl, shortenAddress } from 'utils'
import { formatMax, formatSmartLocaleAware, numberFormatter } from 'utils/format'
import { getExplorerAddressLink } from 'utils/explorer'
import useTimeAgo from 'hooks/useTimeAgo'
import { MouseoverTooltipContent } from 'components/Tooltip'
import NotificationBanner from 'components/NotificationBanner'
import { SupportedChainId, SupportedChainId as ChainId } from 'constants/chains'
import AffiliateStatusCheck from 'components/AffiliateStatusCheck'
import AddressSelector from './AddressSelector'
import { useHasOrders } from 'api/gnosisProtocol/hooks'
import { useAffiliateAddress } from 'state/affiliate/hooks'
import { Title, SectionTitle, HelpCircle } from 'components/Page'
import { ButtonPrimary } from 'custom/components/Button'
import vCOWImage from 'assets/cow-swap/vCOW.png'
import SVG from 'react-inlinesvg'
import ArrowIcon from 'assets/cow-swap/arrow.svg'
import CowImage from 'assets/cow-swap/cow_v2.svg'
import CowProtocolImage from 'assets/cow-swap/cowprotocol.svg'
import { useTokenBalance } from 'state/wallet/hooks'
import { useVCowData, useSwapVCowCallback, useSetSwapVCowStatus, useSwapVCowStatus } from 'state/cowToken/hooks'
import { V_COW_CONTRACT_ADDRESS, COW_CONTRACT_ADDRESS, AMOUNT_PRECISION } from 'constants/index'
import { COW } from 'constants/tokens'
import { useErrorModal } from 'hooks/useErrorMessageAndModal'
import { OperationType } from 'components/TransactionConfirmationModal'
import useTransactionConfirmationModal from 'hooks/useTransactionConfirmationModal'
import AddToMetamask from 'components/AddToMetamask'
import { Link } from 'react-router-dom'
import CopyHelper from 'components/Copy'
import { SwapVCowStatus } from 'state/cowToken/actions'
import LockedGnoVesting from './LockedGnoVesting'
import useBlockNumber from 'lib/hooks/useBlockNumber'
import usePrevious from 'hooks/usePrevious'
import { useCowFromLockedGnoBalances } from 'pages/Account/LockedGnoVesting/hooks'
import { getProviderErrorMessage } from 'utils/misc'

const COW_DECIMALS = COW[ChainId.MAINNET].decimals

// Number of blocks to wait before we re-enable the swap COW -> vCOW button after confirmation
const BLOCKS_TO_WAIT = 2

export default function Profile() {
  const referralLink = useReferralLink()
  const { account, chainId = ChainId.MAINNET, library } = useActiveWeb3React()
  const { profileData, isLoading, error } = useFetchProfile()
  const lastUpdated = useTimeAgo(profileData?.lastUpdated)
  const isTradesTooltipVisible = account && chainId === SupportedChainId.MAINNET && !!profileData?.totalTrades
  const hasOrders = useHasOrders(account)
  const selectedAddress = useAffiliateAddress()
  const previousAccount = usePrevious(account)

  const blockNumber = useBlockNumber()
  const [confirmationBlock, setConfirmationBlock] = useState<undefined | number>(undefined)
  const [shouldUpdate, setShouldUpdate] = useState<boolean>(false)

  const setSwapVCowStatus = useSetSwapVCowStatus()
  const swapVCowStatus = useSwapVCowStatus()

  // Locked GNO balance
  const { loading: isLockedGnoLoading, ...lockedGnoBalances } = useCowFromLockedGnoBalances()

  // Cow balance
  const cow = useTokenBalance(account || undefined, chainId ? COW[chainId] : undefined)

  // vCow balance values
  const { unvested, vested, total, isLoading: isVCowLoading } = useVCowData()

  // Boolean flags
  const hasVestedBalance = vested && !vested.equalTo(0)
  const hasVCowBalance = total && !total.equalTo(0)

  const isSwapPending = swapVCowStatus === SwapVCowStatus.SUBMITTED
  const isSwapInitial = swapVCowStatus === SwapVCowStatus.INITIAL
  const isSwapConfirmed = swapVCowStatus === SwapVCowStatus.CONFIRMED
  const isSwapDisabled = Boolean(
    !hasVestedBalance || !isSwapInitial || isSwapPending || isSwapConfirmed || shouldUpdate
  )

  const isCardsLoading = useMemo(() => {
    let output = isVCowLoading || isLockedGnoLoading || !library

    // remove loader after 5 sec in any case
    setTimeout(() => {
      output = false
    }, 5000)

    return output
  }, [isLockedGnoLoading, isVCowLoading, library])

  const cowBalance = formatSmartLocaleAware(cow, AMOUNT_PRECISION) || '0'
  const cowBalanceMax = formatMax(cow, COW_DECIMALS) || '0'
  const vCowBalanceVested = formatSmartLocaleAware(shouldUpdate ? undefined : vested, AMOUNT_PRECISION) || '0'
  const vCowBalanceVestedMax = vested ? formatMax(shouldUpdate ? undefined : vested, COW_DECIMALS) : '0'
  const vCowBalanceUnvested = formatSmartLocaleAware(unvested, AMOUNT_PRECISION) || '0'
  const vCowBalance = formatSmartLocaleAware(total, AMOUNT_PRECISION) || '0'
  const vCowBalanceMax = total ? formatMax(total, COW_DECIMALS) : '0'

  // Init modal hooks
  const { handleSetError, handleCloseError, ErrorModal } = useErrorModal()
  const { TransactionConfirmationModal, openModal, closeModal } = useTransactionConfirmationModal(
    OperationType.CONVERT_VCOW
  )

  // Handle swaping
  const { swapCallback } = useSwapVCowCallback({
    openModal,
    closeModal,
  })

  const handleVCowSwap = useCallback(async () => {
    handleCloseError()

    if (!swapCallback) {
      return
    }

    setSwapVCowStatus(SwapVCowStatus.ATTEMPTING)

    swapCallback()
      .then(() => {
        setSwapVCowStatus(SwapVCowStatus.SUBMITTED)
      })
      .catch((error) => {
        console.error('[Profile::index::swapVCowCallback]::error', error)
        setSwapVCowStatus(SwapVCowStatus.INITIAL)
        handleSetError(getProviderErrorMessage(error))
      })
  }, [handleCloseError, handleSetError, setSwapVCowStatus, swapCallback])

  const tooltipText = {
    balanceBreakdown: (
      <VestingBreakdown>
        <span>
          <i>Unvested</i> <p>{vCowBalanceUnvested} vCOW</p>
        </span>
        <span>
          <i>Vested</i> <p>{vCowBalanceVested} vCOW</p>
        </span>
      </VestingBreakdown>
    ),
    vested: (
      <div>
        <p>
          <strong>Vested vCOW</strong> is the portion of your vCOW token balance, which is fully available to convert to
          COW token.
        </p>
        <p>
          This includes any vCOW received through an <strong>airdrop.</strong>
        </p>
        <p>When converting your vested vCOW balance to COW, your entire vested balance will be converted.</p>
      </div>
    ),
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

  const renderConvertToCowContent = useCallback(() => {
    let content = null

    if (isSwapPending) {
      content = <span>Converting vCOW...</span>
    } else if (isSwapConfirmed) {
      content = <span>Successfully converted!</span>
    } else {
      content = (
        <>
          Convert to COW <SVG src={ArrowIcon} />
        </>
      )
    }

    return content
  }, [isSwapConfirmed, isSwapPending])

  // Fixes the issue with change in status after swap confirmation
  // Makes sure to wait 2 blocks after confirmation to enable the swap button again
  useEffect(() => {
    if (isSwapConfirmed && !confirmationBlock) {
      setConfirmationBlock(blockNumber)
      setShouldUpdate(true)
    }

    if (!confirmationBlock || !blockNumber) {
      return
    }

    if (isSwapConfirmed && blockNumber - confirmationBlock > BLOCKS_TO_WAIT && hasVestedBalance) {
      setSwapVCowStatus(SwapVCowStatus.INITIAL)
      setConfirmationBlock(undefined)
      setShouldUpdate(false)
    }
  }, [blockNumber, confirmationBlock, hasVestedBalance, isSwapConfirmed, setSwapVCowStatus, shouldUpdate])

  // Reset swap button status on account change
  useEffect(() => {
    if (account && previousAccount && account !== previousAccount && !isSwapInitial) {
      setSwapVCowStatus(SwapVCowStatus.INITIAL)
    }
  }, [account, isSwapInitial, previousAccount, setSwapVCowStatus])

  const currencyCOW = COW[chainId]

  return (
    <Container>
      <TransactionConfirmationModal />
      <ErrorModal />

      {chainId && chainId === ChainId.MAINNET && <AffiliateStatusCheck />}
      <Title>Account</Title>

      <CardsWrapper>
        {isCardsLoading ? (
          <CardsWrapper>
            <CardsLoader>
              <CardsSpinner size="24px" />
            </CardsLoader>
          </CardsWrapper>
        ) : (
          <>
            {hasVCowBalance && (
              <Card showLoader={isVCowLoading || isSwapPending}>
                <BalanceDisplay hAlign="left">
                  <img src={vCOWImage} alt="vCOW token" width="56" height="56" />
                  <span>
                    <i>Total vCOW balance</i>
                    <b>
                      <span title={`${vCowBalanceMax} vCOW`}>{vCowBalance} vCOW</span>{' '}
                      <MouseoverTooltipContent content={tooltipText.balanceBreakdown} wrap>
                        <HelpCircle size={14} />
                      </MouseoverTooltipContent>
                    </b>
                  </span>
                </BalanceDisplay>
                <ConvertWrapper>
                  <BalanceDisplay titleSize={18} altColor={true}>
                    <i>
                      Vested{' '}
                      <MouseoverTooltipContent content={tooltipText.vested} wrap>
                        <HelpCircle size={14} />
                      </MouseoverTooltipContent>
                    </i>
                    <b title={`${vCowBalanceVestedMax} vCOW`}>{vCowBalanceVested}</b>
                  </BalanceDisplay>
                  <ButtonPrimary onClick={handleVCowSwap} disabled={isSwapDisabled}>
                    {renderConvertToCowContent()}
                  </ButtonPrimary>
                </ConvertWrapper>

                <CardActions>
                  <ExtLink href={getBlockExplorerUrl(chainId, V_COW_CONTRACT_ADDRESS[chainId], 'token')}>
                    View contract ↗
                  </ExtLink>
                  <CopyHelper toCopy={V_COW_CONTRACT_ADDRESS[chainId]}>
                    <div title="Click to copy token contract address">Copy contract</div>
                  </CopyHelper>
                </CardActions>
              </Card>
            )}

            <Card>
              <BalanceDisplay titleSize={26}>
                <img src={CowImage} alt="Cow Balance" height="80" width="80" />
                <span>
                  <i>Available COW balance</i>
                  <b title={`${cowBalanceMax} COW`}>{cowBalance} COW</b>
                </span>
              </BalanceDisplay>
              <CardActions>
                <ExtLink
                  title="View contract"
                  href={getBlockExplorerUrl(chainId, COW_CONTRACT_ADDRESS[chainId], 'token')}
                >
                  View contract ↗
                </ExtLink>

                {library?.provider?.isMetaMask && <AddToMetamask shortLabel currency={currencyCOW} />}

                {!library?.provider?.isMetaMask && (
                  <CopyHelper toCopy={COW_CONTRACT_ADDRESS[chainId]}>
                    <div title="Click to copy token contract address">Copy contract</div>
                  </CopyHelper>
                )}

                <Link to={`/swap?outputCurrency=${COW_CONTRACT_ADDRESS[chainId]}`}>Buy COW</Link>
              </CardActions>
            </Card>

            <LockedGnoVesting
              {...lockedGnoBalances}
              loading={isLockedGnoLoading}
              openModal={openModal}
              closeModal={closeModal}
            />

            <BannerCard>
              <BannerCardContent>
                <b>CoW DAO Governance</b>
                <small>
                  Use your (v)COW balance to vote on important proposals or participate in forum discussions.
                </small>
                <span>
                  {' '}
                  <ExtLink href={'https://snapshot.org/#/cow.eth'}>View proposals ↗</ExtLink>
                  <ExtLink href={'https://forum.cow.fi/'}>CoW forum ↗</ExtLink>
                </span>
              </BannerCardContent>
              <BannerCardSvg src={CowProtocolImage} description="CoWDAO Governance" />
            </BannerCard>
          </>
        )}
      </CardsWrapper>

      <Wrapper>
        <GridWrap>
          <CardHead>
            <SectionTitle>Affiliate Program</SectionTitle>
            {account && (
              <Loader isLoading={isLoading}>
                <StyledContainer>
                  <Txt>
                    <RefreshCcw size={16} />
                    &nbsp;&nbsp;
                    <Txt secondary>
                      Last updated
                      <MouseoverTooltipContent content="Data is updated on the background periodically." wrap>
                        <HelpCircle size={14} />
                      </MouseoverTooltipContent>
                      :&nbsp;
                    </Txt>
                    {!lastUpdated ? (
                      '-'
                    ) : (
                      <MouseoverTooltipContent content={<TimeFormatted date={profileData?.lastUpdated} />} wrap>
                        <strong>{lastUpdated}</strong>
                      </MouseoverTooltipContent>
                    )}
                  </Txt>
                  {hasOrders && (
                    <ExtLink href={getExplorerAddressLink(chainId, account)}>
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
                Trades&nbsp;
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
                    <span>
                      Total trades
                      {isTradesTooltipVisible && (
                        <MouseoverTooltipContent
                          content="You may see more trades here than what you see in the activity list. To understand why, check out the FAQ."
                          wrap
                        >
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
