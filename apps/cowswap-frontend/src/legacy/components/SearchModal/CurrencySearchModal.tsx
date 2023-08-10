import { useCallback, useEffect, useState } from 'react'

import { Currency, Token } from '@uniswap/sdk-core'
import { TokenList } from '@uniswap/token-lists'

// import Modal from '../Modal'
import { CurrencySearch } from 'legacy/components/SearchModal/CurrencySearch'
import { ImportList } from 'legacy/components/SearchModal/ImportList'
import { ImportToken } from 'legacy/components/SearchModal/ImportToken'
import Manage from 'legacy/components/SearchModal/Manage'
import usePrevious from 'legacy/hooks/usePrevious'
import { WrappedTokenInfo } from 'legacy/state/lists/wrappedTokenInfo'

import { CowModal as Modal } from 'common/pure/Modal'

import useLast from '../../hooks/useLast'

export interface CurrencySearchModalProps {
  isOpen: boolean
  onDismiss: () => void
  selectedCurrency?: Currency | null
  onCurrencySelect: (currency: Currency) => void
  otherSelectedCurrency?: Currency | null
  showCommonBases?: boolean
  showCurrencyAmount?: boolean
  disableNonToken?: boolean
}

export enum CurrencyModalView {
  search,
  manage,
  importToken,
  importList,
}

export default function CurrencySearchModal({
  isOpen,
  onDismiss,
  onCurrencySelect,
  selectedCurrency,
  otherSelectedCurrency,
  showCommonBases = false,
  showCurrencyAmount = true,
  disableNonToken = false,
}: CurrencySearchModalProps) {
  const [modalView, setModalView] = useState<CurrencyModalView>(CurrencyModalView.manage)
  const lastOpen = useLast(isOpen)

  useEffect(() => {
    if (isOpen && !lastOpen) {
      setModalView(CurrencyModalView.search)
    }
  }, [isOpen, lastOpen])

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      onCurrencySelect(currency)
      onDismiss()
    },
    [onDismiss, onCurrencySelect]
  )

  // for token import view
  const prevView = usePrevious(modalView)

  // used for import token flow
  const [importToken, setImportToken] = useState<Token | undefined>()

  // used for import list
  const [importList, setImportList] = useState<TokenList | undefined>()
  const [listURL, setListUrl] = useState<string | undefined>()

  const showImportView = useCallback(() => setModalView(CurrencyModalView.importToken), [setModalView])
  const showManageView = useCallback(() => setModalView(CurrencyModalView.manage), [setModalView])
  const handleBackImport = useCallback(
    () => setModalView(prevView && prevView !== CurrencyModalView.importToken ? prevView : CurrencyModalView.search),
    [setModalView, prevView]
  )

  // change min height if not searching
  const minHeight = modalView === CurrencyModalView.importToken || modalView === CurrencyModalView.importList ? 40 : 80
  let content = null
  switch (modalView) {
    case CurrencyModalView.search:
      content = (
        <CurrencySearch
          isOpen={isOpen}
          onDismiss={onDismiss}
          onCurrencySelect={handleCurrencySelect}
          selectedCurrency={selectedCurrency}
          otherSelectedCurrency={otherSelectedCurrency}
          showCommonBases={showCommonBases}
          showCurrencyAmount={showCurrencyAmount}
          disableNonToken={disableNonToken}
          showImportView={showImportView}
          setImportToken={setImportToken}
          showManageView={showManageView}
        />
      )
      break
    case CurrencyModalView.importToken:
      if (importToken) {
        content = (
          <ImportToken
            tokens={[importToken]}
            onDismiss={onDismiss}
            list={importToken instanceof WrappedTokenInfo ? importToken.list : undefined}
            onBack={handleBackImport}
            handleCurrencySelect={handleCurrencySelect}
          />
        )
      }
      break
    case CurrencyModalView.importList:
      if (importList && listURL) {
        content = <ImportList list={importList} listURL={listURL} onDismiss={onDismiss} setModalView={setModalView} />
      }
      break
    case CurrencyModalView.manage:
      content = (
        <Manage
          onDismiss={onDismiss}
          setModalView={setModalView}
          setImportToken={setImportToken}
          setImportList={setImportList}
          setListUrl={setListUrl}
        />
      )
      break
  }
  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={80} minHeight={minHeight}>
      {content}
    </Modal>
  )
}
