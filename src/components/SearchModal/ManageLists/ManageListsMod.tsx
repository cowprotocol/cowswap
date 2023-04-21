// eslint-disable-next-line no-restricted-imports
import { t, Trans } from '@lingui/macro'
import { TokenList } from '@uniswap/token-lists'
import { useListColor } from 'hooks/useColor'
import parseENSAddress from 'lib/utils/parseENSAddress'
import uriToHttp from 'lib/utils/uriToHttp'
import { ChangeEvent, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CheckCircle, Settings } from 'react-feather'
import { usePopper } from 'react-popper'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import styled from 'styled-components/macro'
import { useFetchListCallback } from 'hooks/useFetchListCallback'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import useTheme from 'hooks/useTheme'
import useToggle from 'hooks/useToggle'
import { useActiveListUrls, useAllLists, useIsListActive } from 'state/lists/hooks'
import { ExternalLink, IconWrapper, LinkStyledButton, ThemedText } from 'theme'
import listVersionLabel from 'utils/listVersionLabel'
import { ButtonEmpty, ButtonPrimary } from 'components/Button'
import Column, { AutoColumn } from 'components/Column'
import ListLogo from 'components/ListLogo'
import Row, { RowBetween, RowFixed } from 'components/Row'
import Toggle from 'components/Toggle'
import { CurrencyModalView } from 'components/SearchModal/CurrencySearchModal'
import { PaddedColumn, SearchInput, Separator, SeparatorDark } from 'components/SearchModal/styleds'
import { ListRowProps, RowWrapper, Card } from './index'
import { DEFAULT_NETWORK_FOR_LISTS } from 'constants/lists'
import { supportedChainId } from 'utils/supportedChainId'
import { updateListAnalytics, removeListAnalytics, toggleListAnalytics } from 'components/analytics'
import { useWalletInfo } from '@cow/modules/wallet'

const Wrapper = styled(Column)`
  width: 100%;
  height: 100%;
`

const UnpaddedLinkStyledButton = styled(LinkStyledButton)`
  padding: 0;
  font-size: 1rem;
  opacity: ${({ disabled }) => (disabled ? '0.4' : '1')};
`

export const PopoverContainer = styled.div<{ show: boolean }>`
  z-index: 100;
  visibility: ${(props) => (props.show ? 'visible' : 'hidden')};
  opacity: ${(props) => (props.show ? 1 : 0)};
  transition: visibility 150ms linear, opacity 150ms linear;
  background: ${({ theme }) => theme.bg2};
  border: 1px solid ${({ theme }) => theme.bg3};
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  color: ${({ theme }) => theme.text2};
  border-radius: 0.5rem;
  padding: 1rem;
  display: grid;
  grid-template-rows: 1fr;
  grid-gap: 8px;
  font-size: 1rem;
  text-align: left;
`

const StyledMenu = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: none;
`

const StyledTitleText = styled.div<{ active: boolean }>`
  font-size: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 600;
  color: ${({ theme, active }) => (active ? theme.white : theme.text2)};
`

const StyledListUrlText = styled(ThemedText.Main)<{ active: boolean }>`
  font-size: 12px;
  color: ${({ theme, active }) => (active ? theme.white : theme.text2)};
`

function listUrlRowHTMLId(listUrl: string) {
  return `list-row-${listUrl.replace(/\./g, '-')}`
}

const ListRow = memo(function ListRow({
  listUrl,
  acceptListUpdate,
  removeList,
  enableList,
  disableList,
}: ListRowProps & { listUrl: string }) {
  // We default to a chainId if none is available
  const { chainId: connectedChainId } = useWalletInfo()
  const chainId = supportedChainId(connectedChainId) ?? DEFAULT_NETWORK_FOR_LISTS

  const listsByUrl = useAppSelector((state) => state.lists[chainId].byUrl)
  const dispatch = useAppDispatch()
  const { current: list, pendingUpdate: pending } = listsByUrl[listUrl]

  const activeTokensOnThisChain = useMemo(() => {
    if (!list || !chainId) {
      return 0
    }
    return list.tokens.reduce((acc, cur) => (cur.chainId === chainId ? acc + 1 : acc), 0)
  }, [chainId, list])

  const theme = useTheme()
  const listColor = useListColor(list?.logoURI)
  const isActive = useIsListActive(listUrl)

  const [open, toggle] = useToggle(false)
  const node = useRef<HTMLDivElement>()
  const [referenceElement, setReferenceElement] = useState<HTMLDivElement>()
  const [popperElement, setPopperElement] = useState<HTMLDivElement>()

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: 'auto',
    strategy: 'fixed',
    modifiers: [{ name: 'offset', options: { offset: [8, 8] } }],
  })

  useOnClickOutside(node, open ? toggle : undefined)

  const handleAcceptListUpdate = useCallback(() => {
    if (!pending) return
    updateListAnalytics('List Select', listUrl)
    dispatch(acceptListUpdate(listUrl))
  }, [acceptListUpdate, dispatch, listUrl, pending])

  const handleRemoveList = useCallback(() => {
    removeListAnalytics('Start', listUrl)

    if (window.prompt(t`Please confirm you would like to remove this list by typing REMOVE`) === `REMOVE`) {
      removeListAnalytics('Confirm', listUrl)
      dispatch(removeList(listUrl))
    }
  }, [dispatch, listUrl, removeList])

  const handleEnableList = useCallback(() => {
    toggleListAnalytics(true, listUrl)
    dispatch(enableList(listUrl))
  }, [dispatch, enableList, listUrl])

  const handleDisableList = useCallback(() => {
    toggleListAnalytics(false, listUrl)
    dispatch(disableList(listUrl))
  }, [disableList, dispatch, listUrl])

  if (!list) return null

  return (
    <RowWrapper
      active={isActive}
      hasActiveTokens={activeTokensOnThisChain > 0}
      bgColor={listColor}
      key={listUrl}
      id={listUrlRowHTMLId(listUrl)}
    >
      {list.logoURI ? (
        <ListLogo size="40px" style={{ marginRight: '1rem' }} logoURI={list.logoURI} alt={`${list.name} list logo`} />
      ) : (
        <div style={{ width: '24px', height: '24px', marginRight: '1rem' }} />
      )}
      <Column style={{ flex: '1' }}>
        <Row>
          <StyledTitleText active={isActive}>{list.name}</StyledTitleText>
        </Row>
        <RowFixed mt="4px">
          <StyledListUrlText active={isActive} mr="6px">
            <Trans>{activeTokensOnThisChain} tokens</Trans>
          </StyledListUrlText>
          <StyledMenu ref={node as any}>
            <ButtonEmpty onClick={toggle} ref={setReferenceElement} padding="0">
              <Settings stroke={isActive ? theme.bg1 : theme.text1} size={12} />
            </ButtonEmpty>
            {open && (
              <PopoverContainer show={true} ref={setPopperElement as any} style={styles.popper} {...attributes.popper}>
                <div>{list && listVersionLabel(list.version)}</div>
                <SeparatorDark />
                <ExternalLink href={`https://tokenlists.org/token-list?url=${listUrl}`}>
                  <Trans>View list</Trans>
                </ExternalLink>
                <UnpaddedLinkStyledButton onClick={handleRemoveList} disabled={Object.keys(listsByUrl).length === 1}>
                  <Trans>Remove list</Trans>
                </UnpaddedLinkStyledButton>
                {pending && (
                  <UnpaddedLinkStyledButton onClick={handleAcceptListUpdate}>
                    <Trans>Update list</Trans>
                  </UnpaddedLinkStyledButton>
                )}
              </PopoverContainer>
            )}
          </StyledMenu>
        </RowFixed>
      </Column>
      <Toggle
        isActive={isActive}
        bgColor={listColor}
        toggle={() => {
          isActive ? handleDisableList() : handleEnableList()
        }}
      />
    </RowWrapper>
  )
})

export const ListContainer = styled.div`
  height: 100%;
  overflow-y: auto; // fallback for 'overlay'
  overflow-y: overlay;
  ${({ theme }) => theme.colorScrollbar};
`

export function ManageLists({
  setModalView,
  setImportList,
  setListUrl,
  // MOD
  unsupportedListUrls,
  listRowProps,
}: {
  setModalView: (view: CurrencyModalView) => void
  setImportList: (list: TokenList) => void
  setListUrl: (url: string) => void
  unsupportedListUrls: string[]
  listRowProps: ListRowProps
}) {
  const { chainId } = useWalletInfo()
  const theme = useTheme()

  const [listUrlInput, setListUrlInput] = useState<string>('')

  const lists = useAllLists()

  const tokenCountByListName = useMemo<Record<string, number>>(
    () =>
      Object.values(lists).reduce((acc, { current: list }) => {
        if (!list) {
          return acc
        }
        return {
          ...acc,
          [list.name]: list.tokens.reduce((count: number, token) => (token.chainId === chainId ? count + 1 : count), 0),
        }
      }, {}),
    [chainId, lists]
  )

  // sort by active but only if not visible
  const activeListUrls = useActiveListUrls()

  const handleInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setListUrlInput(e.target.value)
  }, [])

  const fetchList = useFetchListCallback()

  const validUrl: boolean = useMemo(() => {
    return uriToHttp(listUrlInput).length > 0 || Boolean(parseENSAddress(listUrlInput))
  }, [listUrlInput])

  // Mod: Sort only on initial component load to avoid jumping UI issues
  // Next time the component is loaded, the lists will be sorted
  const sortedLists = useMemo(() => {
    const listsUrls = Object.keys(lists)

    return listsUrls.sort((listUrlA, listUrlB) => {
      const { current: listA } = lists[listUrlA]
      const { current: listB } = lists[listUrlB]

      // first filter on active lists
      if (activeListUrls?.includes(listUrlA) && !activeListUrls?.includes(listUrlB)) {
        return -1
      }
      if (!activeListUrls?.includes(listUrlA) && activeListUrls?.includes(listUrlB)) {
        return 1
      }

      if (listA && listB) {
        if (tokenCountByListName[listA.name] > tokenCountByListName[listB.name]) {
          return -1
        }
        if (tokenCountByListName[listA.name] < tokenCountByListName[listB.name]) {
          return 1
        }
        return listA.name.toLowerCase() < listB.name.toLowerCase()
          ? -1
          : listA.name.toLowerCase() === listB.name.toLowerCase()
          ? 0
          : 1
      }
      if (listA) return -1
      if (listB) return 1
      return 0
    })
    // This is fine to have empty dependencies here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredLists = useMemo(
    () => {
      return sortedLists.filter((listUrl) => {
        // only show loaded lists, hide unsupported lists
        // return Boolean(lists[listUrl].current) && !Boolean(UNSUPPORTED_LIST_URLS.includes(listUrl))
        return Boolean(lists[listUrl]?.current) && !Boolean(unsupportedListUrls.includes(listUrl))
      })
    },
    // [lists, activeListUrls, tokenCountByListName]
    [sortedLists, lists, unsupportedListUrls]
  )

  // temporary fetched list for import flow
  const [tempList, setTempList] = useState<TokenList>()
  const [addError, setAddError] = useState<string | undefined>()

  useEffect(() => {
    async function fetchTempList() {
      fetchList(listUrlInput, false)
        .then((list) => setTempList(list))
        .catch(() => setAddError(t`Error importing list`))
    }
    // if valid url, fetch details for card
    if (validUrl) {
      fetchTempList()
    } else {
      setTempList(undefined)
      listUrlInput !== '' && setAddError(t`Enter valid list location`)
    }

    // reset error
    if (listUrlInput === '') {
      setAddError(undefined)
    }
  }, [fetchList, listUrlInput, validUrl])

  // check if list is already imported
  const isImported = Object.keys(lists).includes(listUrlInput)

  // set list values and have parent modal switch to import list view
  const handleImport = useCallback(() => {
    if (!tempList) return
    setImportList(tempList)
    setModalView(CurrencyModalView.importList)
    setListUrl(listUrlInput)
  }, [listUrlInput, setImportList, setListUrl, setModalView, tempList])

  return (
    <Wrapper>
      <PaddedColumn gap="14px">
        <Row>
          <SearchInput
            type="text"
            id="list-add-input"
            placeholder={t`https:// or ipfs:// or ENS name`}
            value={listUrlInput}
            onChange={handleInput}
          />
        </Row>
        {addError ? (
          <ThemedText.Error title={addError} style={{ textOverflow: 'ellipsis', overflow: 'hidden' }} error>
            {addError}
          </ThemedText.Error>
        ) : null}
      </PaddedColumn>
      {tempList && (
        <PaddedColumn style={{ paddingTop: 0 }}>
          <Card backgroundColor={theme.bg2} padding="12px 20px">
            <RowBetween>
              <RowFixed>
                {tempList.logoURI && <ListLogo logoURI={tempList.logoURI} size="40px" />}
                <AutoColumn gap="4px" style={{ marginLeft: '20px' }}>
                  <ThemedText.Body fontWeight={600}>{tempList.name}</ThemedText.Body>
                  <ThemedText.Main fontSize={'12px'}>
                    <Trans>{tempList.tokens.length} tokens</Trans>
                  </ThemedText.Main>
                </AutoColumn>
              </RowFixed>
              {isImported ? (
                <RowFixed>
                  <IconWrapper stroke={theme.text2} size="16px" marginRight={'10px'}>
                    <CheckCircle />
                  </IconWrapper>
                  <ThemedText.Body color={theme.text2}>
                    <Trans>Loaded</Trans>
                  </ThemedText.Body>
                </RowFixed>
              ) : (
                <ButtonPrimary
                  style={{ fontSize: '14px' }}
                  padding="6px 8px"
                  width="fit-content"
                  onClick={handleImport}
                >
                  <Trans>Import</Trans>
                </ButtonPrimary>
              )}
            </RowBetween>
          </Card>
        </PaddedColumn>
      )}
      <Separator />
      <ListContainer>
        <AutoColumn gap="md" id="tokens-lists-table">
          {filteredLists.map((listUrl) => (
            <ListRow key={listUrl} listUrl={listUrl} {...listRowProps} />
          ))}
        </AutoColumn>
      </ListContainer>
    </Wrapper>
  )
}
