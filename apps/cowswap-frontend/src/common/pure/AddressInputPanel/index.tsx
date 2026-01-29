/* eslint-disable max-lines-per-function */
/* eslint-disable complexity */
import {
  ChangeEvent,
  CSSProperties,
  FocusEvent,
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import OrderCheckIcon from '@cowprotocol/assets/cow-swap/order-check.svg'
import { getChainInfo } from '@cowprotocol/common-const'
import {
  getBlockExplorerUrl as getExplorerLink,
  isPrefixedAddress,
  parsePrefixedAddress,
} from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useENS } from '@cowprotocol/ens'
import { ExternalLink, RowBetween, UI } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Trans, useLingui } from '@lingui/react/macro'
import QR_SCAN_ICON from 'assets/icon/qr-scan.svg'
import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

import { AutoColumn } from 'legacy/components/Column'
import { useIsDarkMode } from 'legacy/state/user/hooks'

import { getChainType, getNonEvmChainLabel } from 'common/chains/nonEvm'
import { getNonEvmAllowlist } from 'common/chains/nonEvmTokenAllowlist'
import { QrScanModal } from 'common/pure/QrScanModal'
import {
  validateBitcoinRecipient,
  validateRecipientForChain,
  validateSolanaRecipient,
} from 'common/recipient/nonEvmRecipientValidation'

import { autofocus } from '../../utils/autofocus'
import ChainPrefixWarning from '../ChainPrefixWarning'

const InputPanel = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  position: relative;
  border-radius: 16px;
  background-color: var(${UI.COLOR_PAPER_DARKER});
  color: inherit;
  z-index: 1;
  width: 100%;
`

const ContainerRow = styled.div<{ error: boolean; $flattenBottomCorners?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: ${({ $flattenBottomCorners }) => ($flattenBottomCorners ? '16px 16px 0 0' : '16px')};
  border: 0;
  color: inherit;
  background-color: var(${UI.COLOR_PAPER_DARKER});
  position: relative;

  &::after {
    content: '';
    display: block;
    width: 100%;
    position: absolute;
    bottom: -2px;
    left: 0;
    height: 2px;
    border-radius: ${({ $flattenBottomCorners }) => ($flattenBottomCorners ? '0' : '24px')};
    background: var(${UI.COLOR_PAPER});
    z-index: -1;
  }
`

export const InputContainer = styled.div`
  flex: 1;
  padding: 1rem;
`

const Input = styled.input<{ error?: boolean }>`
  font-size: var(--recipient-font-size, 1.25rem);
  font-family: var(${UI.FONT_FAMILY_MONO}), Arial, sans-serif;
  letter-spacing: -0.2px;
  outline: none;
  border: none;
  flex: 1 1 auto;
  background: none;
  transition: color 0.2s ${({ error }) => (error ? 'step-end' : 'step-start')};
  color: ${({ error }) => (error ? `var(${UI.COLOR_DANGER})` : 'inherit')};
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
  width: 100%;

  padding: 0px;
  appearance: textfield;
  -webkit-appearance: textfield;

  ::-webkit-search-decoration {
    -webkit-appearance: none;
  }

  ::-webkit-outer-spin-button,
  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }

  &&::placeholder {
    color: inherit;
    opacity: 0.5;
    font-size: var(--recipient-placeholder-font-size, inherit);
  }

  &:focus::placeholder {
    color: transparent;
  }

  ::placeholder {
    color: ${({ theme }) => theme.text4};
    font-size: var(--recipient-placeholder-font-size, inherit);
  }
`

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
`

const HeaderLink = styled(ExternalLink)`
  font-family: var(${UI.FONT_FAMILY_PRIMARY}), Arial, sans-serif;
  font-size: 13.3333px;
  line-height: 1.2;
  font-weight: 400;
  color: inherit;
  opacity: 0.7;
  text-decoration: none;

  &:hover {
    opacity: 1;
    color: var(${UI.COLOR_TEXT});
    text-decoration: underline;
  }
`

const ActionButton = styled.button`
  border: none;
  background: transparent;
  padding: 0;
  margin: 0;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
  display: inline-flex;
  align-items: center;
  gap: 4px;

  &:hover {
    opacity: 1;
  }
`

const MessageText = styled.div<{ $error?: boolean }>`
  margin-top: 6px;
  font-size: 13px;
  color: ${({ $error }) => ($error ? `var(${UI.COLOR_DANGER})` : 'inherit')};
  opacity: ${({ $error }) => ($error ? 1 : 0.8)};
`

const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`

const ChainIcon = styled.img`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  flex: 0 0 auto;
`

const ValidIcon = styled(SVG)`
  width: 14px;
  height: 14px;
  flex: 0 0 auto;

  > path {
    fill: var(${UI.COLOR_SUCCESS});
  }
`
const QrIcon = styled(SVG)`
  width: 16px;
  height: 16px;
  flex: 0 0 auto;
  color: inherit;
`
const LabelRow = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
`

const LabelText = styled.span`
  font-size: 14px;
  font-weight: 500;
`

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// TODO: Reduce function complexity by extracting logic

const SOLANA_MAX_FONT_SIZE = 20
const SOLANA_MIN_FONT_SIZE = 18
const stripRecipientNoise = (input: string): string => {
  const withoutWhitespace = input.replace(/\s+/g, '')
  return withoutWhitespace.replace(/^[("'\\[{<]+/, '').replace(/[)"'\]}>.,;:!?]+$/, '')
}

export function AddressInputPanel({
  id,
  className = 'recipient-address-input',
  label,
  placeholder,
  value,
  onChange,
  targetChainId,
  enableEns = true,
  disableExplorerLink = false,
  enableQrScan = false,
  isValid,
  errorMessage,
  warningText,
  pattern,
  flattenBottomCorners = false,
}: {
  id?: string
  className?: string
  label?: ReactNode
  placeholder?: string
  value: string
  onChange: (value: string) => void
  targetChainId?: number
  enableEns?: boolean
  disableExplorerLink?: boolean
  enableQrScan?: boolean
  isValid?: boolean
  errorMessage?: ReactNode
  warningText?: ReactNode
  pattern?: string
  flattenBottomCorners?: boolean
}): ReactElement {
  const { t } = useLingui()
  const { chainId: walletChainId } = useWalletInfo()
  // Use targetChainId if provided (for cross-chain), otherwise fall back to wallet's chain
  const chainId = targetChainId ?? walletChainId
  const supportedChainId =
    typeof chainId === 'number' && chainId in SupportedChainId ? (chainId as SupportedChainId) : undefined
  const chainInfo = supportedChainId ? getChainInfo(supportedChainId) : undefined
  const chainType = getChainType(chainId)
  const nonEvmAllowlist = getNonEvmAllowlist(chainId)
  const nonEvmLogoUrl = nonEvmAllowlist?.tokens[0]?.logoUrl
  const enableEnsEffective = enableEns && chainType === 'evm'
  const addressPrefix = chainInfo?.addressPrefix
  const { address, loading, name } = useENS(enableEnsEffective ? value : '')
  const [chainPrefixWarning, setChainPrefixWarning] = useState('')
  const isDarkMode = useIsDarkMode()
  const inputRef = useRef<HTMLInputElement>(null)
  const measureCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const [solanaFontSize, setSolanaFontSize] = useState<number | undefined>(undefined)
  const [isFocused, setIsFocused] = useState(false)
  const [displayValue, setDisplayValue] = useState(value)
  const [isQrScanOpen, setIsQrScanOpen] = useState(false)
  const [qrScanStream, setQrScanStream] = useState<MediaStream | null>(null)
  const [qrScanError, setQrScanError] = useState<string | null>(null)

  const updateSolanaFontSize = useCallback((): void => {
    if (chainType !== 'solana') {
      setSolanaFontSize(undefined)
      return
    }

    const input = inputRef.current
    if (!input) return

    const maxFontSize = SOLANA_MAX_FONT_SIZE
    const minFontSize = SOLANA_MIN_FONT_SIZE
    const text = isFocused ? value : displayValue

    if (!text) {
      setSolanaFontSize(maxFontSize)
      return
    }

    const availableWidth = input.clientWidth
    if (!availableWidth) return

    const computedStyle = window.getComputedStyle(input)
    const fontWeight = computedStyle.fontWeight || '500'
    const fontFamily = computedStyle.fontFamily || 'inherit'
    const fontStyle = computedStyle.fontStyle || 'normal'

    const canvas = measureCanvasRef.current ?? (measureCanvasRef.current = document.createElement('canvas'))
    const context = canvas.getContext('2d')
    if (!context) return

    context.font = `${fontStyle} ${fontWeight} ${maxFontSize}px ${fontFamily}`
    const textWidth = context.measureText(text).width
    const nextFontSize =
      textWidth > availableWidth
        ? Math.max(minFontSize, Math.floor((maxFontSize * availableWidth) / textWidth))
        : maxFontSize

    setSolanaFontSize(nextFontSize)
  }, [chainType, displayValue, isFocused, value])

  const handleInput = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.target.value
      setChainPrefixWarning('')
      let value = stripRecipientNoise(input)

      if (isPrefixedAddress(value)) {
        const { prefix, address } = parsePrefixedAddress(value)

        // Only show prefix warnings when we know the expected prefix for the current chain
        if (prefix && addressPrefix && addressPrefix !== prefix) {
          setChainPrefixWarning(prefix)
        }

        if (address) {
          value = address
        }
      }

      onChange(value)
    },
    [onChange, addressPrefix],
  )

  const replaceQrScanStream = useCallback(
    (nextStream: MediaStream | null): void => {
      if (qrScanStream && qrScanStream !== nextStream) {
        qrScanStream.getTracks().forEach((track) => track.stop())
      }
      setQrScanStream(nextStream)
    },
    [qrScanStream],
  )

  const requestQrScanStream = useCallback(
    async (deviceId?: string | null): Promise<MediaStream | null> => {
      if (!navigator?.mediaDevices?.getUserMedia) {
        setQrScanError(t`Camera access is not available in this browser.`)
        return null
      }
      if (!window.isSecureContext) {
        setQrScanError(t`Camera access requires a secure context.`)
        return null
      }

      const buildConstraints = (id?: string | null): MediaStreamConstraints => ({
        video: id
          ? {
              deviceId: { exact: id },
            }
          : {
              facingMode: { ideal: 'environment' },
            },
        audio: false,
      })

      try {
        const preferredStream = await navigator.mediaDevices.getUserMedia(buildConstraints(deviceId))
        setQrScanError(null)
        replaceQrScanStream(preferredStream)
        return preferredStream
      } catch (error) {
        const name = error instanceof Error ? error.name : ''
        if (name === 'NotFoundError' || name === 'OverconstrainedError') {
          try {
            const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            setQrScanError(null)
            replaceQrScanStream(fallbackStream)
            return fallbackStream
          } catch {
            setQrScanError(t`Camera access was denied or is unavailable.`)
            return null
          }
        }
        setQrScanError(t`Camera access was denied or is unavailable.`)
        return null
      }
    },
    [replaceQrScanStream, t],
  )

  const handleClear = useCallback(() => onChange(''), [onChange])
  const normalizeScannedValue = useCallback((scannedValue: string): string => {
    const trimmedValue = scannedValue.trim()
    const withoutQuery = trimmedValue.split('?')[0]
    const withoutScheme = withoutQuery.replace(/^[a-zA-Z]+:/, '')
    const withoutChainId = withoutScheme.split('@')[0]

    return withoutChainId
  }, [])
  const handlePaste = useCallback(async () => {
    if (!navigator?.clipboard?.readText) return

    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        const normalized = stripRecipientNoise(normalizeScannedValue(text))
        if (normalized) {
          onChange(normalized)
        }
      }
    } catch (error) {
      console.debug('[AddressInputPanel] Failed to read clipboard', error)
    }
  }, [normalizeScannedValue, onChange])
  const handleOpenQrScan = useCallback(() => {
    setQrScanError(null)
    setIsQrScanOpen(true)
    void requestQrScanStream()
  }, [requestQrScanStream])

  const handleCloseQrScan = useCallback(() => {
    setIsQrScanOpen(false)
    replaceQrScanStream(null)
  }, [replaceQrScanStream])
  const handleQrScanResult = useCallback(
    (scannedValue: string): boolean => {
      const normalizedValue = normalizeScannedValue(scannedValue)
      if (chainType !== 'evm') {
        if (chainType === 'solana' && validateBitcoinRecipient(normalizedValue).isValid) {
          setQrScanError(t`Bitcoin address detected. Scan a valid Solana address.`)
          return false
        }
        if (chainType === 'bitcoin' && validateSolanaRecipient(normalizedValue).isValid) {
          setQrScanError(t`Solana address detected. Scan a valid Bitcoin address.`)
          return false
        }
        const validation = validateRecipientForChain(chainId, normalizedValue)
        if (!validation.isValid) {
          const chainLabel = chainId != null ? getNonEvmChainLabel(chainId) : undefined
          setQrScanError(
            chainLabel ? t`Invalid ${chainLabel} address scanned, please try again.` : t`Invalid address scanned.`,
          )
          return false
        }
      }

      setQrScanError(null)
      onChange(normalizedValue)
      setIsQrScanOpen(false)
      return true
    },
    [chainId, chainType, normalizeScannedValue, onChange, t],
  )

  //clear warning if target chainId changes and we are now on the right network
  useEffect(() => {
    if (chainPrefixWarning && chainPrefixWarning === addressPrefix) {
      setChainPrefixWarning('')
    }
  }, [chainPrefixWarning, addressPrefix])

  useEffect(() => {
    updateSolanaFontSize()
  }, [updateSolanaFontSize])

  useEffect(() => {
    if (chainType !== 'solana') return

    const handleResize = (): void => updateSolanaFontSize()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [chainType, updateSolanaFontSize])

  const defaultError = Boolean(enableEnsEffective && value.length > 0 && !loading && !address)
  const error = typeof isValid === 'boolean' ? !isValid && (value.length > 0 || Boolean(errorMessage)) : defaultError
  const resolvedAddress = enableEnsEffective ? address : value
  const explorerAddress = name || resolvedAddress || undefined
  const canShowExplorerLink = Boolean(
    !disableExplorerLink && supportedChainId && resolvedAddress && (!enableEnsEffective || address),
  )
  const nonEvmExplorerUrl =
    chainType === 'solana' && resolvedAddress
      ? `https://solscan.io/account/${resolvedAddress}`
      : chainType === 'bitcoin' && resolvedAddress
        ? `https://www.blockchain.com/explorer/addresses/btc/${resolvedAddress}`
        : undefined
  const showNonEvmViewLink = Boolean(nonEvmExplorerUrl && resolvedAddress && (typeof isValid !== 'boolean' || isValid))
  const nonEvmChainLabel = typeof chainId === 'number' ? getNonEvmChainLabel(chainId) : undefined
  const defaultLabelText =
    chainType === 'evm' ? t`Recipient` : nonEvmChainLabel ? t`Send to ${nonEvmChainLabel} wallet` : t`Send to wallet`
  const defaultPlaceholderText = chainType === 'evm' ? t`Wallet Address or ENS name` : t`Enter wallet address`
  const showChainIconPrefix = chainType !== 'evm' && Boolean(nonEvmLogoUrl)
  const isValidRecipient = Boolean(resolvedAddress && !error)
  const shouldAbbreviateAddress = chainType !== 'evm' && isValidRecipient && !isFocused
  const showScanButton = enableQrScan && !isValidRecipient
  const qrScanTitle = t`Scan QR code`

  const abbreviateAddress = useCallback(
    (address: string): string => {
      if (chainType === 'bitcoin') {
        if (address.length <= 18) return address

        return `${address.slice(0, 8)}…${address.slice(-8)}`
      }

      if (address.length <= 18) return address

      return `${address.slice(0, 8)}…${address.slice(-6)}`
    },
    [chainType],
  )

  useEffect(() => {
    if (isFocused) {
      setDisplayValue(value)
      return
    }

    setDisplayValue(shouldAbbreviateAddress ? abbreviateAddress(value) : value)
  }, [abbreviateAddress, isFocused, shouldAbbreviateAddress, value])

  const handleFocus = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      setDisplayValue(value)
      autofocus(event)
    },
    [value],
  )

  const handleBlur = useCallback(() => {
    setIsFocused(false)
  }, [])
  const inputStyle: CSSProperties = {
    ...(chainType === 'solana'
      ? {
          '--recipient-font-size': solanaFontSize ? `${solanaFontSize}px` : undefined,
          '--recipient-placeholder-font-size': `${SOLANA_MIN_FONT_SIZE}px`,
        }
      : {}),
    ...(shouldAbbreviateAddress ? { letterSpacing: '0.2px' } : {}),
  }

  return (
    <InputPanel id={id}>
      {chainPrefixWarning && chainInfo && (
        <ChainPrefixWarning chainPrefixWarning={chainPrefixWarning} chainInfo={chainInfo} isDarkMode={isDarkMode} />
      )}
      <ContainerRow error={error} $flattenBottomCorners={flattenBottomCorners}>
        <InputContainer>
          <AutoColumn gap="md">
            <RowBetween>
              <LabelRow>
                {showChainIconPrefix && nonEvmLogoUrl && (
                  <ChainIcon src={nonEvmLogoUrl} alt={`${chainType} icon`} aria-hidden="true" />
                )}
                <LabelText>{label ?? defaultLabelText}</LabelText>
              </LabelRow>
              <HeaderActions>
                {canShowExplorerLink && supportedChainId && explorerAddress && (
                  <HeaderLink href={getExplorerLink(supportedChainId, 'address', explorerAddress)}>
                    <Trans>(View on Explorer)</Trans>
                  </HeaderLink>
                )}
                {showScanButton && (
                  <ActionButton type="button" onClick={handleOpenQrScan}>
                    <QrIcon src={QR_SCAN_ICON} aria-hidden="true" />
                    <Trans>Scan</Trans>
                  </ActionButton>
                )}
                {!showNonEvmViewLink && (
                  <ActionButton type="button" onClick={handlePaste}>
                    <Trans>Paste</Trans>
                  </ActionButton>
                )}
                {value && (
                  <ActionButton type="button" onClick={handleClear}>
                    <Trans>Clear</Trans>
                  </ActionButton>
                )}
                {showNonEvmViewLink && nonEvmExplorerUrl && (
                  <HeaderLink href={nonEvmExplorerUrl}>
                    <Trans>View ↗</Trans>
                  </HeaderLink>
                )}
              </HeaderActions>
            </RowBetween>
            <InputRow>
              {isValidRecipient && <ValidIcon src={OrderCheckIcon} aria-hidden="true" />}
              <Input
                className={className}
                type="text"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                placeholder={placeholder ?? defaultPlaceholderText}
                error={error}
                pattern={pattern ?? (enableEnsEffective ? '^(0x[a-fA-F0-9]{40})$' : undefined)}
                onChange={handleInput}
                value={displayValue}
                ref={inputRef}
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </InputRow>
            {error && errorMessage && <MessageText $error>{errorMessage}</MessageText>}
            {!error && warningText && <MessageText>{warningText}</MessageText>}
          </AutoColumn>
        </InputContainer>
      </ContainerRow>
      {enableQrScan && (
        <QrScanModal
          isOpen={isQrScanOpen}
          onDismiss={handleCloseQrScan}
          onScan={handleQrScanResult}
          stream={qrScanStream}
          onRequestStream={requestQrScanStream}
          errorMessage={qrScanError}
          title={qrScanTitle}
          iconUrl={chainType !== 'evm' ? nonEvmLogoUrl : undefined}
          iconAlt={chainType !== 'evm' && nonEvmChainLabel ? `${nonEvmChainLabel} icon` : undefined}
        />
      )}
    </InputPanel>
  )
}
