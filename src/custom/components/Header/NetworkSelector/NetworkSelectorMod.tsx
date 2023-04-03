import { ArrowDownCircle } from 'react-feather'
import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { getWeb3ReactConnection, isChainAllowed } from '@cow/modules/wallet/web3-react/connection'
import { getChainInfo } from 'constants/chainInfo'
import { CHAIN_IDS_TO_NAMES } from 'constants/chains'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import useParsedQueryString from 'hooks/useParsedQueryString'
// import usePrevious from 'hooks/usePrevious'
import { ParsedQs } from 'qs'
import { useCallback, useEffect, useRef } from 'react'
import { AlertTriangle, ChevronDown } from 'react-feather'
import { useLocation, useNavigate } from 'react-router-dom'
import { useCloseModal, useModalIsOpen, useOpenModal, useToggleModal } from 'state/application/hooks'
import { /*addPopup,*/ ApplicationModal } from 'state/application/reducer'
import { updateConnectionError } from 'state/connection/reducer'
import { useAppDispatch } from 'state/hooks'
import { ExternalLink, MEDIA_WIDTHS } from 'theme'
import { replaceURLParam } from 'utils/routes'
import { switchChain } from '@cow/modules/wallet/web3-react/hooks/switchChain'
// import { isMobile } from 'utils/userAgent'

// Mod imports
import { transparentize, darken } from 'polished'
import { getExplorerBaseUrl } from 'utils/explorer'
import { SUPPORTED_CHAIN_IDS, supportedChainId } from 'utils/supportedChainId'
import { useIsSmartContractWallet } from '@cow/common/hooks/useIsSmartContractWallet'
import { css } from 'styled-components/macro'
import { useRemovePopup, useAddPopup } from 'state/application/hooks'
import { useTradeTypeInfo } from '@cow/modules/trade'
import { useMediaQuery, upToMedium } from 'hooks/useMediaQuery'
import { useWalletInfo } from '@cow/modules/wallet'

export const ActiveRowLinkList = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 8px;
  & > a {
    align-items: center;
    color: ${({ theme }) => theme.text1};
    display: flex;
    flex-direction: row;
    font-size: 14px;
    font-weight: 500;
    justify-content: space-between;
    padding: 8px 0 4px 6px;
    text-decoration: none;
  }
  & > a:first-child {
    margin: 0;
    margin-top: 0px;
    padding-top: 10px;
  }
`
export const ActiveRowWrapper = styled.div`
  background-color: ${({ theme }) => theme.bg1};
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
  padding: 8px;
`
export const FlyoutHeader = styled.div`
  color: ${({ theme }) => theme.text1};
  font-weight: 400;
`

export const LinkOutCircle = styled(ArrowDownCircle)`
  transform: rotate(230deg);
  width: 16px;
  height: 16px;
`
export const FlyoutMenu = styled.div`
  position: absolute;
  top: 54px;
  width: 272px;
  z-index: 99;
  padding-top: 10px;
  /* @media screen and (min-width: ${MEDIA_WIDTHS.upToSmall}px) {
    top: 38px;
  } */

  /* ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    right: 20%;
  `} */
`
// mod: actually, this is closer to original version but I haven't yet pulled latest from uniswap
export const FlyoutMenuContents = styled.div`
  align-items: flex-start;
  background-color: ${({ theme }) => theme.bg1};
  border: 1px solid ${({ theme }) => theme.bg0};
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  font-size: 16px;
  overflow: auto;
  padding: 10px 12px;
  & > *:not(:last-child) {
    margin-bottom: 5px;
  }

  ${ActiveRowWrapper} {
    background-color: ${({ theme }) => transparentize(0.4, theme.bg4)};
  }
`
const FlyoutRow = styled.div<{ active: boolean }>`
  align-items: center;
  background-color: ${({ active, theme }) =>
    active
      ? // theme.primary1
        theme.bg2 // MOD
      : 'transparent'};
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  font-weight: 500;
  justify-content: space-between;
  padding: 6px 8px;
  text-align: left;
  width: 100%;
  color: ${({ active, theme }) =>
    active
      ? // theme.text2
        theme.white // MOD
      : theme.text1};
  &:hover {
    color: ${({ theme, active }) => !active && theme.text1};
    background: ${
      ({ theme, active }) =>
        !active &&
        // theme.bg4
        transparentize(0.9, theme.text1) // MOD
    };
  }
  transition: background 0.13s ease-in-out;
`
export const FlyoutRowActiveIndicator = styled.div<{ active: boolean }>`
  background-color: ${({ active, theme }) => (active ? theme.green1 : '#a7a7a7')};
  border-radius: 50%;
  height: 9px;
  width: 9px;
`
/* const LinkOutCircle = styled(ArrowDownCircle)`
  transform: rotate(230deg);
  width: 16px;
  height: 16px;
` */
const Logo = styled.img`
  // height: 20px;
  // width: 20px;
  width: 24px; // MOD
  height: 24px; // MOD
  margin-right: 8px;
`
const NetworkLabel = styled.div`
  flex: 1 1 auto;
  margin: 0px auto 0px 8px; // mod
`
export const SelectorLabel = styled(NetworkLabel)`
  display: none;
  margin-left: 0; // mod
  @media screen and (min-width: ${MEDIA_WIDTHS.upToSmall}px) {
    display: block;
    margin-right: 8px;
  }
`
const NetworkAlertLabel = styled(NetworkLabel)`
  display: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0 0.5rem 0 0.4rem;
  font-size: 1rem;
  width: fit-content;
  font-weight: 500;
  @media screen and (min-width: ${MEDIA_WIDTHS.upToSmall}px) {
    display: block;
  }
`
export const SelectorControls = styled.div<{ supportedChain: boolean }>`
  align-items: center;
  background-color: ${({ theme }) => theme.bg4};
  border: 1px solid ${({ theme }) => theme.bg0};
  border-radius: 12px;
  color: ${({ theme }) => theme.text1};
  display: flex;
  font-weight: 500;
  justify-content: space-between;
  padding: 6px 8px;
  ${({ supportedChain, theme }) =>
    !supportedChain &&
    // `
    //   color: white;
    //   background-color: ${theme.red1};
    //   border: 2px solid ${theme.red1};
    // `}

    // MOD
    // Todo: Prevent usage of !important
    `
      color: ${theme.danger}!important;
      background: ${transparentize(0.85, theme.danger)}!important;
      border: 2px solid ${transparentize(0.5, theme.danger)}!important;
    `}
  :focus {
    background-color: ${({ theme }) => darken(0.1, theme.red1)};
  }
`
const SelectorLogo = styled(Logo)<{ interactive?: boolean }>`
  margin-right: ${({ interactive }) => (interactive ? 8 : 0)}px;
  @media screen and (min-width: ${MEDIA_WIDTHS.upToSmall}px) {
    margin-right: 8px;
  }
`
const SelectorWrapper = styled.div`
  @media screen and (min-width: ${MEDIA_WIDTHS.upToSmall}px) {
    position: relative;
  }
`
const StyledChevronDown = styled(ChevronDown)`
  width: 12px;
`

const NetworkIcon = styled(AlertTriangle)`
  margin-left: 0.25rem;
  margin-right: 0.25rem;
  width: 16px;
  height: 16px;
`

const BridgeLabel = ({ chainId }: { chainId: SupportedChainId }) => {
  switch (chainId) {
    // case SupportedChainId.ARBITRUM_ONE:
    // case SupportedChainId.ARBITRUM_RINKEBY:
    //   return <Trans>Arbitrum Bridge</Trans>
    // case SupportedChainId.OPTIMISM:
    // case SupportedChainId.OPTIMISTIC_KOVAN:
    //   return <Trans>Optimism Bridge</Trans>
    // case SupportedChainId.POLYGON:
    // case SupportedChainId.POLYGON_MUMBAI:
    //   return <Trans>Polygon Bridge</Trans>
    // case SupportedChainId.CELO:
    // case SupportedChainId.CELO_ALFAJORES:
    //   return <Trans>Portal Bridge</Trans>
    default:
      return <Trans>Bridge</Trans>
  }
}
const ExplorerLabel = ({ chainId }: { chainId: SupportedChainId }) => {
  switch (chainId) {
    // case SupportedChainId.ARBITRUM_ONE:
    // case SupportedChainId.ARBITRUM_RINKEBY:
    //   return <Trans>Arbiscan</Trans>
    // case SupportedChainId.OPTIMISM:
    // case SupportedChainId.OPTIMISTIC_KOVAN:
    //   return <Trans>Optimistic Etherscan</Trans>
    // case SupportedChainId.POLYGON:
    // case SupportedChainId.POLYGON_MUMBAI:
    //   return <Trans>Polygonscan</Trans>
    // case SupportedChainId.CELO:
    // case SupportedChainId.CELO_ALFAJORES:
    //   return <Trans>Blockscout</Trans>
    case SupportedChainId.GNOSIS_CHAIN:
      return <Trans>Gnosisscan</Trans>
    default:
      return <Trans>Etherscan</Trans>
  }
}

function Row({
  targetChain,
  onSelectChain,
}: {
  targetChain: SupportedChainId
  onSelectChain: (targetChain: number) => void
}) {
  const { chainId } = useWalletInfo()
  const { provider } = useWeb3React()
  if (!provider || !chainId) {
    return null
  }
  const active = chainId === targetChain
  const { helpCenterUrl, explorer, bridge, label, logoUrl } = getChainInfo(targetChain)

  const rowContent = (
    <FlyoutRow onClick={() => onSelectChain(targetChain)} active={active}>
      <Logo src={logoUrl} />
      <NetworkLabel>{label}</NetworkLabel>
      {chainId === targetChain && <FlyoutRowActiveIndicator active />}
    </FlyoutRow>
  )

  if (active) {
    return (
      <ActiveRowWrapper>
        {rowContent}
        <ActiveRowLinkList>
          {bridge && (
            <ExternalLink href={bridge}>
              <BridgeLabel chainId={chainId} /> <LinkOutCircle />
            </ExternalLink>
          )}
          {explorer && (
            <ExternalLink href={explorer}>
              <ExplorerLabel chainId={chainId} /> <LinkOutCircle />
            </ExternalLink>
          )}
          {helpCenterUrl && (
            <ExternalLink href={helpCenterUrl}>
              <Trans>Help Center</Trans> <LinkOutCircle />
            </ExternalLink>
          )}

          {supportedChainId(chainId) && (
            <ExternalLink href={getExplorerBaseUrl(chainId)}>
              <Trans>CoW Protocol Explorer</Trans> <LinkOutCircle />
            </ExternalLink>
          )}
        </ActiveRowLinkList>
      </ActiveRowWrapper>
    )
  }
  return rowContent
}

export const getParsedChainId = (parsedQs?: ParsedQs) => {
  const chain = parsedQs?.chain
  if (!chain || typeof chain !== 'string') return { urlChain: undefined, urlChainId: undefined }

  return { urlChain: chain.toLowerCase(), urlChainId: getChainIdFromName(chain) }
}

const getChainIdFromName = (name: string) => {
  const entry = Object.entries(CHAIN_IDS_TO_NAMES).find(([_, n]) => n === name)
  const chainId = entry?.[0]
  return chainId ? parseInt(chainId) : undefined
}

export const getChainNameFromId = (id: string | number) => {
  // casting here may not be right but fine to return undefined if it's not a supported chain ID
  return CHAIN_IDS_TO_NAMES[id as SupportedChainId] || ''
}

export const NETWORK_SELECTOR_CHAINS: SupportedChainId[] = SUPPORTED_CHAIN_IDS
/* const NETWORK_SELECTOR_CHAINS = [
  SupportedChainId.MAINNET,
  SupportedChainId.POLYGON,
  SupportedChainId.OPTIMISM,
  SupportedChainId.ARBITRUM_ONE,
  SupportedChainId.CELO,
] */

export default function NetworkSelector() {
  const dispatch = useAppDispatch()
  const { provider, connector } = useWeb3React()
  const { chainId, account } = useWalletInfo()
  // const previousChainId = usePrevious(chainId)
  const parsedQs = useParsedQueryString()
  const { urlChain, urlChainId } = getParsedChainId(parsedQs)
  // const previousUrlChainId = usePrevious(urlChainId)
  const node = useRef<HTMLDivElement>(null)
  const isOpen = useModalIsOpen(ApplicationModal.NETWORK_SELECTOR)
  const openModal = useOpenModal(ApplicationModal.NETWORK_SELECTOR)
  const closeModal = useCloseModal(ApplicationModal.NETWORK_SELECTOR)
  const toggleModal = useToggleModal(ApplicationModal.NETWORK_SELECTOR)
  const navigate = useNavigate()
  const location = useLocation()
  const tradeTypeInfo = useTradeTypeInfo()
  const isSmartContractWallet = useIsSmartContractWallet() // mod
  const isUnsupportedNetwork = !supportedChainId(chainId)

  // MOD - to keep track of the switching in progress and avoid race conditions
  const isSwitching = useRef(false)

  const addPopup = useAddPopup()
  const removePopup = useRemovePopup()

  const info = getChainInfo(chainId)

  const setChainIdToUrl = useCallback(
    (chainId: SupportedChainId) => {
      // Don't set chainId as query parameter because swap and limit orders have different routing scheme
      if (tradeTypeInfo) return

      navigate(
        {
          pathname: location.pathname,
          search: replaceURLParam(location.search, 'chain', getChainNameFromId(chainId)),
        },
        { replace: true }
      )
    },
    [tradeTypeInfo, navigate, location]
  )

  const onSelectChain = useCallback(
    async (targetChain: SupportedChainId, skipClose?: boolean) => {
      if (!connector) return

      isSwitching.current = true

      const connectionType = getWeb3ReactConnection(connector).type

      try {
        dispatch(updateConnectionError({ connectionType, error: undefined }))
        await switchChain(connector, targetChain)

        setChainIdToUrl(targetChain)
      } catch (error: any) {
        console.error('Failed to switch networks', error)

        dispatch(updateConnectionError({ connectionType, error: error.message }))
        addPopup({ failedSwitchNetwork: targetChain }, 'failed-network-switch')
      }

      if (!skipClose) {
        closeModal()
      }

      isSwitching.current = false
    },
    [connector, dispatch, setChainIdToUrl, addPopup, closeModal]
  )

  useEffect(() => {
    if (isSwitching.current) {
      // if wallet switching is in progress, avoid triggering it again
      return
    }
    if (account && chainId && chainId !== urlChainId) {
      // if wallet is connected and chainId already set, keep the url param in sync
      setChainIdToUrl(chainId)
    } else if (urlChainId && chainId && urlChainId !== chainId) {
      // if chain and url chainId are both set and differ, try to update chainid
      onSelectChain(urlChainId, true).catch(() => {
        // we want app network <-> chainId param to be in sync, so if user changes the network by changing the URL
        // but the request fails, revert the URL back to current chainId
        setChainIdToUrl(chainId)
      })
    }
  }, [account, chainId, setChainIdToUrl, onSelectChain, urlChainId])

  // set chain parameter on initial load if not there
  useEffect(() => {
    if (chainId && !urlChainId) {
      setChainIdToUrl(chainId)
    }
  }, [chainId, setChainIdToUrl, urlChainId, urlChain])

  // Mod: to show popup for unsupported network
  useEffect(() => {
    const POPUP_KEY = chainId?.toString()

    if (POPUP_KEY && isUnsupportedNetwork) {
      addPopup(
        {
          failedSwitchNetwork: chainId as SupportedChainId,
          unsupportedNetwork: true,
          styles: css`
            /* background: ${({ theme }) => theme.yellow3}; */
            background: ${({ theme }) => theme.alert}; // mod
            color: ${({ theme }) => theme.black}; // mod
          `,
        },
        POPUP_KEY,
        null
      )
    }

    return () => {
      POPUP_KEY && removePopup(POPUP_KEY)
    }
  }, [addPopup, chainId, dispatch, isUnsupportedNetwork, removePopup])

  // Mod: Detect viewport changes and set isUpToMedium
  const isUpToMedium = useMediaQuery(upToMedium)

  if (!chainId || !provider || isSmartContractWallet) {
    return null
  }

  const isChainSupported = supportedChainId(chainId)

  return (
    <SelectorWrapper
      ref={node}
      onMouseEnter={!isUpToMedium ? openModal : undefined}
      onMouseLeave={!isUpToMedium ? closeModal : undefined}
      onClick={isUpToMedium ? toggleModal : undefined}
    >
      <SelectorControls supportedChain={!!isChainSupported}>
        {isChainSupported ? (
          <>
            <SelectorLogo src={info?.logoUrl} />
            <SelectorLabel>{info?.label}</SelectorLabel>
            <StyledChevronDown />
          </>
        ) : (
          <>
            <NetworkIcon />
            <NetworkAlertLabel>Switch Network</NetworkAlertLabel>
            <StyledChevronDown />
          </>
        )}
      </SelectorControls>
      {isOpen && (
        <FlyoutMenu>
          <FlyoutMenuContents>
            <FlyoutHeader>
              <Trans>Select a {!isChainSupported ? ' supported ' : ''}network</Trans>
            </FlyoutHeader>
            {NETWORK_SELECTOR_CHAINS.map((chainId: SupportedChainId) =>
              isChainAllowed(connector, chainId) ? (
                <Row onSelectChain={onSelectChain} targetChain={chainId} key={chainId} />
              ) : null
            )}
          </FlyoutMenuContents>
        </FlyoutMenu>
      )}
    </SelectorWrapper>
  )
}
