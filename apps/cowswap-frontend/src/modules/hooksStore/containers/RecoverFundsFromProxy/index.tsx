import { atom, useAtom } from 'jotai'
import { useCallback, useEffect, useState } from 'react'

import IMG_ICON_MINUS from '@cowprotocol/assets/images/icon-minus.svg'
import IMG_ICON_PLUS from '@cowprotocol/assets/images/icon-plus.svg'
import { useNativeTokenBalance } from '@cowprotocol/balances-and-allowances'
import { getCurrencyAddress, getEtherscanLink, getIsNativeToken } from '@cowprotocol/common-utils'
import { Command } from '@cowprotocol/types'
import { ButtonPrimary, ExternalLink, Loader, TokenAmount } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import ms from 'ms.macro'
import SVG from 'react-inlinesvg'
import useSWR from 'swr'

import { useErrorModal } from 'legacy/hooks/useErrorMessageAndModal'
import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import {
  SelectTokenWidget,
  useOpenTokenSelectWidget,
  useSourceChainId,
  useSelectTokenWidgetState,
  useUpdateSelectTokenWidgetState,
} from 'modules/tokensList'

import { useTokenContract } from 'common/hooks/useContract'
import { CurrencySelectButton } from 'common/pure/CurrencySelectButton'
import { NewModal } from 'common/pure/NewModal'

import { Content, FAQItem, FAQWrapper, ProxyInfo, Title, Wrapper } from './styled'
import { useRecoverFundsFromProxy } from './useRecoverFundsFromProxy'

const BALANCE_UPDATE_INTERVAL = ms`5s`
const BALANCE_SWR_CFG = { refreshInterval: BALANCE_UPDATE_INTERVAL, revalidateOnFocus: true }

const selectedCurrencyAtom = atom<Currency | undefined>(undefined)

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
function FAQ({ explorerLink }: { explorerLink: string | undefined }) {
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({})

  const handleToggle = (index: number) => (e: React.MouseEvent) => {
    e.preventDefault()
    setOpenItems((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  const FAQ_DATA = [
    {
      question: 'What is CoW Shed?',
      answer: (
        <>
          <ExternalLink href="https://github.com/cowdao-grants/cow-shed">CoW Shed</ExternalLink> is a helper contract
          that enhances user experience inside CoW Swap for features like{' '}
          <ExternalLink href="https://docs.cow.fi/cow-protocol/reference/core/intents/hooks">CoW Hooks</ExternalLink>
          .
          <br />
          <br />
          This contract is deployed only once per account. This account becomes the only owner. CoW Shed will act as an
          intermediary account who will do the trading on your behalf.
          <br />
          <br />
          Because this contract holds the funds temporarily, it's possible the funds are stuck in some edge cases. This
          tool will help you recover your funds.
        </>
      ),
    },
    {
      question: 'How do I recover my funds from CoW Shed?',
      answer: (
        <>
          <ol>
            <li>
              {explorerLink ? (
                <ExternalLink href={explorerLink}>Check in the block explorer</ExternalLink>
              ) : (
                'Check in block explorer'
              )}{' '}
              if your own CoW Shed has any token
            </li>
            <li>Select the token you want to recover from CoW Shed</li>
            <li>Recover!</li>
          </ol>
        </>
      ),
    },
  ]

  return (
    <FAQWrapper>
      {FAQ_DATA.map((faq, index) => (
        <FAQItem key={index} open={openItems[index]}>
          <summary onClick={handleToggle(index)}>
            {faq.question}
            <i>
              <SVG src={openItems[index] ? IMG_ICON_MINUS : IMG_ICON_PLUS} />
            </i>
          </summary>
          {openItems[index] && <div>{faq.answer}</div>}
        </FAQItem>
      ))}
    </FAQWrapper>
  )
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type, complexity
export function RecoverFundsFromProxy({ onDismiss }: { onDismiss: Command }) {
  const [selectedCurrency, setSelectedCurrency] = useAtom(selectedCurrencyAtom)
  const [tokenBalance, setTokenBalance] = useState<CurrencyAmount<Currency> | null>(null)

  const selectedTokenAddress = selectedCurrency ? getCurrencyAddress(selectedCurrency) : undefined
  const hasBalance = !!tokenBalance?.greaterThan(0)
  const isNativeToken = !!selectedCurrency && getIsNativeToken(selectedCurrency)

  const { ErrorModal, handleSetError } = useErrorModal()
  const addTransaction = useTransactionAdder()
  const { contract: erc20Contract, chainId: erc20ChainId } = useTokenContract(selectedTokenAddress)
  const onSelectToken = useOpenTokenSelectWidget()
  const updateSelectTokenWidget = useUpdateSelectTokenWidgetState()
  const { open: isSelectTokenWidgetOpen } = useSelectTokenWidgetState()
  const sourceChainId = useSourceChainId()

  const onDismissCallback = useCallback(() => {
    updateSelectTokenWidget({ open: false })
    onDismiss()
  }, [updateSelectTokenWidget, onDismiss])

  const {
    callback: recoverFundsCallback,
    isTxSigningInProgress,
    proxyAddress,
  } = useRecoverFundsFromProxy(selectedTokenAddress, tokenBalance, isNativeToken)

  const { isLoading: isErc20BalanceLoading } = useSWR(
    !isNativeToken && erc20Contract && proxyAddress && selectedCurrency
      ? [erc20Contract, proxyAddress, selectedCurrency]
      : null,
    async ([erc20Contract, proxyAddress, selectedCurrency]) => {
      const balance = await erc20Contract.balanceOf(proxyAddress)

      setTokenBalance(CurrencyAmount.fromRawAmount(selectedCurrency, balance.toHexString()))
    },
    BALANCE_SWR_CFG,
  )

  const { isLoading: isNativeBalanceLoading, data: nativeTokenBalance } = useNativeTokenBalance(
    isNativeToken ? proxyAddress : undefined,
    sourceChainId,
    BALANCE_SWR_CFG,
  )

  useEffect(() => {
    if (!selectedCurrency || !nativeTokenBalance) return

    setTokenBalance(CurrencyAmount.fromRawAmount(selectedCurrency, nativeTokenBalance.toHexString()))
  }, [selectedCurrency, nativeTokenBalance])

  const isBalanceLoading = isErc20BalanceLoading || isNativeBalanceLoading

  const recoverFunds = useCallback(async () => {
    try {
      const txHash = await recoverFundsCallback()

      if (txHash) {
        addTransaction({ hash: txHash, summary: 'Recover funds from CoW Shed Proxy' })
      }
    } catch (e) {
      console.error(e)
      handleSetError(e.message || e.toString())
    }
  }, [recoverFundsCallback, addTransaction, handleSetError])

  const onCurrencySelectClick = useCallback(() => {
    onSelectToken(selectedCurrency, undefined, undefined, setSelectedCurrency)
  }, [onSelectToken, selectedCurrency, setSelectedCurrency])

  const explorerLink = proxyAddress ? getEtherscanLink(erc20ChainId, 'address', proxyAddress) : undefined

  return (
    <Wrapper>
      <NewModal
        modalMode={false}
        title="CoW Shed"
        onDismiss={onDismissCallback}
        contentPadding="10px"
        justifyContent="flex-start"
      >
        <ErrorModal />
        <SelectTokenWidget />
        {!isSelectTokenWidgetOpen && (
          <>
            <Content>
              <Title>Recover funds</Title>

              <ProxyInfo>
                <h4>Proxy account:</h4>
                {explorerLink && (
                  <ExternalLink href={explorerLink}>
                    <span>{proxyAddress} ↗</span>
                  </ExternalLink>
                )}
              </ProxyInfo>

              <CurrencySelectButton currency={selectedCurrency} loading={false} onClick={onCurrencySelectClick} />

              {selectedTokenAddress ? (
                <>
                  <p>
                    Balance to be recovered:
                    <br />
                    {tokenBalance ? (
                      <b>
                        <TokenAmount amount={tokenBalance} defaultValue="0" tokenSymbol={tokenBalance.currency} />
                      </b>
                    ) : isBalanceLoading ? (
                      <Loader />
                    ) : null}
                  </p>
                  <ButtonPrimary onClick={recoverFunds} disabled={!hasBalance || isTxSigningInProgress}>
                    {isTxSigningInProgress ? (
                      <Loader />
                    ) : hasBalance ? (
                      'Recover funds'
                    ) : (
                      <span className="noFunds">No funds to recover</span>
                    )}
                  </ButtonPrimary>
                </>
              ) : (
                <div></div>
              )}
            </Content>
            <FAQ explorerLink={explorerLink} />
          </>
        )}
      </NewModal>
    </Wrapper>
  )
}
