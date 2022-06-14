import { Trans } from '@lingui/macro'
import { CHAIN_INFO } from 'constants/chainInfo'
import { CHAIN_IDS_TO_NAMES, SupportedChainId } from 'constants/chains'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
// import { useOnClickOutside } from 'hooks/useOnClickOutside'
// import useParsedQueryString from 'hooks/useParsedQueryString'
// import usePrevious from 'hooks/usePrevious'
import { ParsedQs } from 'qs'
// import { useCallback, useEffect, useRef } from 'react'
import { /* ArrowDownCircle,  */ ChevronDown } from 'react-feather'
// import { useHistory } from 'react-router-dom'
// import { useModalOpen, useToggleModal } from 'state/application/hooks'
// import { addPopup, ApplicationModal } from 'state/application/reducer'
import styled, { css } from 'styled-components/macro'
import { ExternalLink, MEDIA_WIDTHS } from 'theme'
// import { replaceURLParam } from 'utils/routes'
// import { useAppDispatch } from 'state/hooks'
// import { switchToNetwork } from 'utils/switchToNetwork'
// MOD imports
import {
  ActiveRowLinkList,
  ActiveRowWrapper,
  FlyoutHeader,
  LinkOutCircle,
} from '@src/components/Header/NetworkSelector'
import useChangeNetworks, { ChainSwitchCallbackOptions } from 'hooks/useChangeNetworks'
import { transparentize } from 'polished'
// mod
import { UnsupportedChainIdError, useWeb3React } from 'web3-react-core'
import { useAddPopup, useRemovePopup } from 'state/application/hooks'
import { useEffect } from 'react'
import { getExplorerBaseUrl } from 'utils/explorer'

import { useWalletInfo } from 'hooks/useWalletInfo'

import { isMobile } from 'utils/userAgent'

/* const ActiveRowLinkList = styled.div`
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
` */
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
const FlyoutMenuContents = styled.div`
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

  // mod
  min-width: 175px;
  z-index: 99;
  @media screen and (min-width: ${MEDIA_WIDTHS.upToSmall}px) {
    top: 50px;
  }
  ${ActiveRowWrapper} {
    background-color: ${({ theme }) => transparentize(0.4, theme.bg4)};
  }
`
const FlyoutRow = styled.div<{ active: boolean }>`
  align-items: center;
  background-color: ${({ active, theme }) => (active ? theme.primary1 : 'transparent')};
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  font-weight: 500;
  justify-content: space-between;
  padding: 6px 8px;
  text-align: left;
  width: 100%;
  color: ${({ active, theme }) => (active ? theme.text2 : theme.text1)};
  &:hover {
    color: ${({ theme, active }) => !active && theme.text1};
    background: ${({ theme, active }) => !active && theme.bg4};
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
  height: 20px;
  // width: 20px; // mod
  width: 16px;
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
export const SelectorControls = styled.div<{ interactive: boolean }>`
  align-items: center;
  background-color: ${({ theme }) => theme.bg4};
  border: 1px solid ${({ theme }) => theme.bg0};
  border-radius: 12px;
  color: ${({ theme }) => theme.text1};
  cursor: ${({ interactive }) => (interactive ? 'pointer' : 'auto')};
  display: flex;
  font-weight: 500;
  justify-content: space-between;
  padding: 6px 8px;
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
const BridgeLabel = ({ chainId }: { chainId: SupportedChainId }) => {
  switch (chainId) {
    /* case SupportedChainId.ARBITRUM_ONE:
    case SupportedChainId.ARBITRUM_RINKEBY:
      return <Trans>Arbitrum Bridge</Trans>
    case SupportedChainId.OPTIMISM:
    case SupportedChainId.OPTIMISTIC_KOVAN:
      return <Trans>Optimism Gateway</Trans>
    case SupportedChainId.POLYGON:
    case SupportedChainId.POLYGON_MUMBAI:
      return <Trans>Polygon Bridge</Trans>*/
    case SupportedChainId.RINKEBY:
      return <Trans>Faucet</Trans>
    default:
      return <Trans>Bridge</Trans>
  }
}
const ExplorerLabel = ({ chainId }: { chainId: SupportedChainId }) => {
  switch (chainId) {
    /* case SupportedChainId.ARBITRUM_ONE:
    case SupportedChainId.ARBITRUM_RINKEBY:
      return <Trans>Arbiscan</Trans>
    case SupportedChainId.OPTIMISM:
    case SupportedChainId.OPTIMISTIC_KOVAN:
      return <Trans>Optimistic Etherscan</Trans>
    case SupportedChainId.POLYGON:
    case SupportedChainId.POLYGON_MUMBAI:
      return <Trans>Polygonscan</Trans> */
    case SupportedChainId.GNOSIS_CHAIN:
      return <Trans>Blockscout</Trans>
    default:
      return <Trans>Etherscan</Trans>
  }
}

function Row({
  targetChain,
  onSelectChain,
}: {
  targetChain: SupportedChainId
  // onSelectChain: (targetChain: number) => void
  onSelectChain: (targetChain: number, options: ChainSwitchCallbackOptions) => void // mod
}) {
  const { library, chainId } = useActiveWeb3React()
  if (!library || !chainId) {
    return null
  }
  const active = chainId === targetChain
  const { helpCenterUrl, explorer, bridge, label, logoUrl } = CHAIN_INFO[targetChain]

  const rowContent = (
    <FlyoutRow
      onClick={() => onSelectChain(targetChain, { skipToggle: false, skipWalletToggle: false })}
      active={active}
    >
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
          {bridge ? (
            <ExternalLink href={bridge}>
              <BridgeLabel chainId={chainId} /> <LinkOutCircle />
            </ExternalLink>
          ) : null}
          {explorer ? (
            <ExternalLink href={explorer}>
              <ExplorerLabel chainId={chainId} /> <LinkOutCircle />
            </ExternalLink>
          ) : null}
          {helpCenterUrl ? (
            <ExternalLink href={helpCenterUrl}>
              <Trans>Help Center</Trans> <LinkOutCircle />
            </ExternalLink>
          ) : null}

          <ExternalLink href={getExplorerBaseUrl(chainId)}>
            <Trans>CoW Protocol Explorer</Trans> <LinkOutCircle />
          </ExternalLink>
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

export default function NetworkSelector() {
  // mod: add account & lib
  const { account, chainId, library } = useActiveWeb3React()
  const { isSmartContractWallet } = useWalletInfo() // mod
  // mod: refactored inner logic into useChangeNetworks hook
  const { node, open, toggle, info, handleChainSwitch } = useChangeNetworks({ account, chainId, library })

  // mod: add error and isUnsupportedNetwork const and useEffect
  const { error } = useWeb3React()
  const isUnsupportedNetwork = error instanceof UnsupportedChainIdError
  const addPopup = useAddPopup()
  const removePopup = useRemovePopup()

  // mod: When on mobile, disable on hover and enable on click events
  const onHoverEvent = () => !isMobile && toggle()
  const onClickEvent = () => isMobile && toggle()

  useEffect(() => {
    const POPUP_KEY = chainId?.toString()

    if (POPUP_KEY && isUnsupportedNetwork) {
      addPopup(
        {
          failedSwitchNetwork: chainId as SupportedChainId,
          unsupportedNetwork: true,
          styles: css`
            background: ${({ theme }) => theme.yellow3};
          `,
        },
        // ID
        POPUP_KEY,
        // null to disable auto hide
        null
      )
    }

    return () => {
      POPUP_KEY && removePopup(POPUP_KEY)
    }
  }, [addPopup, chainId, isUnsupportedNetwork, removePopup])

  /* const parsedQs = useParsedQueryString()
  const { urlChain, urlChainId } = getParsedChainId(parsedQs)
  const prevChainId = usePrevious(chainId)
  const node = useRef<HTMLDivElement>()
  const open = useModalOpen(ApplicationModal.NETWORK_SELECTOR)
  const toggle = useToggleModal(ApplicationModal.NETWORK_SELECTOR)
  useOnClickOutside(node, open ? toggle : undefined)

  const history = useHistory()

  const info = chainId ? CHAIN_INFO[chainId] : undefined

  const dispatch = useAppDispatch()

  const handleChainSwitch = useCallback(
    (targetChain: number, skipToggle?: boolean) => {
      if (!library) return
      switchToNetwork({ library, chainId: targetChain })
        .then(() => {
          if (!skipToggle) {
            toggle()
          }
          history.replace({
            search: replaceURLParam(history.location.search, 'chain', getChainNameFromId(targetChain)),
          })
        })
        .catch((error) => {
          console.error('Failed to switch networks', error)

          // we want app network <-> chainId param to be in sync, so if user changes the network by changing the URL
          // but the request fails, revert the URL back to current chainId
          if (chainId) {
            history.replace({ search: replaceURLParam(history.location.search, 'chain', getChainNameFromId(chainId)) })
          }

          if (!skipToggle) {
            toggle()
          }

          dispatch(addPopup({ content: { failedSwitchNetwork: targetChain }, key: `failed-network-switch` }))
        })
    },
    [dispatch, library, toggle, history, chainId]
  )

  useEffect(() => {
    if (!chainId || !prevChainId) return

    // when network change originates from wallet or dropdown selector, just update URL
    if (chainId !== prevChainId) {
      history.replace({ search: replaceURLParam(history.location.search, 'chain', getChainNameFromId(chainId)) })
      // otherwise assume network change originates from URL
    } else if (urlChainId && urlChainId !== chainId) {
      handleChainSwitch(urlChainId, true)
    }
  }, [chainId, urlChainId, prevChainId, handleChainSwitch, history])

  // set chain parameter on initial load if not there
  useEffect(() => {
    if (chainId && !urlChainId) {
      history.replace({ search: replaceURLParam(history.location.search, 'chain', getChainNameFromId(chainId)) })
    }
  }, [chainId, history, urlChainId, urlChain]) */

  if (!chainId || !info || isUnsupportedNetwork || isSmartContractWallet) {
    return null
  }

  return (
    <SelectorWrapper ref={node as any} onMouseEnter={onHoverEvent} onMouseLeave={onHoverEvent} onClick={onClickEvent}>
      {/*<SelectorControls onClick={conditionalToggle} interactive={showSelector}>
        <SelectorLogo interactive={showSelector} src={info.logoUrl || mainnetInfo.logoUrl} />*/}
      <SelectorControls interactive>
        <SelectorLogo interactive src={info.logoUrl} />
        <SelectorLabel>{info.label}</SelectorLabel>
        {/*{showSelector && <StyledChevronDown />}*/}
        <StyledChevronDown />
      </SelectorControls>
      {open && (
        /*<FlyoutMenu>
          {ALL_SUPPORTED_CHAIN_IDS.map((targetChain) => {
            const active = !!account && chainId === targetChain
            const rowText = CHAIN_INFO[targetChain].label
            const callback = () => networkCallback(targetChain)

            return (
              <FlyoutRow key={targetChain} onClick={callback} active={active}>
                <Logo src={CHAIN_INFO[targetChain].logoUrl} />
                <NetworkLabel>{rowText}</NetworkLabel>
                <FlyoutRowActiveIndicator active={active} />
              </FlyoutRow>
            )
          })}
        </FlyoutMenu>*/

        <FlyoutMenu>
          <FlyoutMenuContents>
            <FlyoutHeader>
              <Trans>Select a network</Trans>
            </FlyoutHeader>
            <Row onSelectChain={handleChainSwitch} targetChain={SupportedChainId.MAINNET} />
            <Row onSelectChain={handleChainSwitch} targetChain={SupportedChainId.RINKEBY} />
            <Row onSelectChain={handleChainSwitch} targetChain={SupportedChainId.GNOSIS_CHAIN} />
          </FlyoutMenuContents>
        </FlyoutMenu>
      )}
    </SelectorWrapper>
  )
}
