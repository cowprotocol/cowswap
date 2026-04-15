import { ReactElement } from 'react'

import { TargetChainId } from '@cowprotocol/cow-sdk'

import { useLingui } from '@lingui/react/macro'
import { CheckCircle } from 'react-feather'

import { useIsDarkMode } from 'legacy/state/user/hooks'

import { useOnAddressInput } from './hooks/useOnAddressInput'
import { useReceiverChainInfo } from './hooks/useReceiverChainInfo'
import { useReceiverValidation } from './hooks/useReceiverValidation'
import { ReceiverErrorText, ReceiverInput, ReceiverInputRow, ReceiverInputWrapper, ValidCheckmark } from './styled'

import { autofocus } from '../../utils/autofocus'
import ChainPrefixWarning from '../ChainPrefixWarning'

export interface ReceiverPanelBodyProps {
  className: string
  value: string
  onChange(value: string): void
  targetChainId?: TargetChainId
  placeholder?: string
}

export function ReceiverPanelBody({
  className,
  value,
  onChange,
  targetChainId,
  placeholder,
}: ReceiverPanelBodyProps): ReactElement {
  const { t } = useLingui()
  const { strategy, isNonEvm, chainInfo } = useReceiverChainInfo(targetChainId)
  const { isValid, isError, loading } = useReceiverValidation(value, targetChainId)
  const { handleInput, chainPrefixWarning } = useOnAddressInput(onChange, chainInfo?.addressPrefix, strategy)
  const isDarkMode = useIsDarkMode()

  const resolvedPlaceholder =
    placeholder ?? (strategy.placeholderKey === 'nonEvm' ? t`Recipient address` : t`Wallet Address or ENS name`)

  return (
    <>
      {chainPrefixWarning && (
        <ChainPrefixWarning chainPrefixWarning={chainPrefixWarning} chainInfo={chainInfo} isDarkMode={isDarkMode} />
      )}
      <ReceiverInputWrapper>
        <ReceiverInputRow>
          {isValid && !loading && (
            <ValidCheckmark>
              <CheckCircle size={20} />
            </ValidCheckmark>
          )}
          <ReceiverInput
            className={className}
            type="text"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder={resolvedPlaceholder}
            $error={isError}
            pattern={strategy.pattern}
            onChange={handleInput}
            value={value}
            onFocus={autofocus}
          />
        </ReceiverInputRow>
        {isError && <ReceiverErrorText>Enter a valid {isNonEvm ? chainInfo?.label : ''} address</ReceiverErrorText>}
      </ReceiverInputWrapper>
    </>
  )
}
