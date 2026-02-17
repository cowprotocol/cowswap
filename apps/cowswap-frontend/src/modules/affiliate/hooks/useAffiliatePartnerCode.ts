import { Dispatch, FormEvent, RefObject, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import { t } from '@lingui/core/macro'
import QRCode from 'react-qrcode-logo'

import { useAffiliatePartnerCodeAvailability } from 'modules/affiliate/hooks/useAffiliatePartnerCodeAvailability'
import { PartnerCodeResponse } from 'modules/affiliate/lib/affiliateProgramTypes'
import { buildPartnerTypedData, generateSuggestedCode } from 'modules/affiliate/lib/affiliateProgramUtils'

import { useModalState } from 'common/hooks/useModalState'

const isAffiliateNetworkError = (error: Error & { status?: number }): boolean => {
  if (typeof error.status === 'number') {
    return false
  }

  const message = error.message || ''
  return message.includes('Failed to fetch') || message.includes('NetworkError') || message.includes('Load failed')
}

interface UseAffiliatePartnerCodeParams {
  account: string | undefined
  chainId: number | undefined
  isMainnet: boolean
  existingCode: string | null
  setErrorMessage: Dispatch<SetStateAction<string | null>>
  createAffiliateCode: (params: {
    code: string
    walletAddress: string
    signedMessage: string
  }) => Promise<PartnerCodeResponse>
}

interface UseAffiliatePartnerCodeResult {
  inputRef: RefObject<HTMLInputElement | null>
  qrCodeRef: RefObject<QRCode | null>
  inputCode: string
  referralLink: string
  availability: ReturnType<typeof useAffiliatePartnerCodeAvailability>['availability']
  canSave: boolean
  submitting: boolean
  isQrOpen: boolean
  onCreate: () => Promise<void>
  onInputChange: (event: FormEvent<HTMLInputElement>) => void
  onGenerate: () => void
  onOpenQr: () => void
  onDismissQr: () => void
  onDownloadQr: (fileType: 'png' | 'jpg' | 'webp') => void
}

export function useAffiliatePartnerCode({
  account,
  chainId,
  isMainnet,
  existingCode,
  setErrorMessage,
  createAffiliateCode,
}: UseAffiliatePartnerCodeParams): UseAffiliatePartnerCodeResult {
  const provider = useWalletProvider()
  const [submitting, setSubmitting] = useState(false)
  const [inputCode, setInputCode] = useState('')
  const [hasEdited, setHasEdited] = useState(false)
  const { isModalOpen: isQrOpen, openModal: openQrModal, closeModal: closeQrModal } = useModalState()
  const qrCodeRef = useRef<QRCode | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const showCreateForm = !!account && isMainnet && !existingCode && !!provider
  const { normalizedCode, isCodeValid, availability, availabilityErrorMessage } = useAffiliatePartnerCodeAvailability({
    inputCode,
    canVerify: showCreateForm && !!chainId,
  })

  useEffect(() => {
    if (!showCreateForm || hasEdited || inputCode) {
      return
    }
    setInputCode(generateSuggestedCode())
  }, [hasEdited, inputCode, showCreateForm])

  useEffect(() => {
    if (availabilityErrorMessage) {
      setErrorMessage(availabilityErrorMessage)
    }
  }, [availabilityErrorMessage, setErrorMessage])

  const onCreate = useCallback(async (): Promise<void> => {
    if (!account) {
      setErrorMessage(t`Connect your wallet to create a code.`)
      return
    }
    if (!isMainnet) {
      setErrorMessage(t`Switch to Ethereum mainnet to create a code.`)
      return
    }
    if (!isCodeValid) {
      setErrorMessage(t`Enter a code with 5-20 characters (A-Z, 0-9, - or _).`)
      return
    }
    if (!provider) {
      setErrorMessage(t`Wallet signer unavailable.`)
      return
    }

    if (availability !== 'available') {
      if (availability === 'unavailable' || availability === 'error') {
        setErrorMessage(t`That code is unavailable. Try another.`)
      }
      return
    }

    setSubmitting(true)
    setErrorMessage(null)

    try {
      const signer = provider.getSigner()
      const typedData = buildPartnerTypedData({
        walletAddress: account,
        code: normalizedCode,
        chainId: SupportedChainId.MAINNET,
      })
      const signedMessage = await signer._signTypedData(typedData.domain, typedData.types, typedData.message)
      await createAffiliateCode({ code: normalizedCode, walletAddress: account, signedMessage })
    } catch (error) {
      const err = error as Error & { status?: number; code?: number }
      if (isAffiliateNetworkError(err)) {
        setErrorMessage(t`Affiliate service is unreachable. Try again later.`)
      } else if (err.code === 4001) {
        setErrorMessage(t`Signature request rejected.`)
      } else if (err.status === 409) {
        setErrorMessage(t`Code already taken or wallet already linked.`)
      } else if (err.status === 401) {
        setErrorMessage(t`Signature invalid. Please try again.`)
      } else if (err.status === 403) {
        setErrorMessage(t`That code is unavailable. Try another.`)
      } else if (err.status === 422) {
        setErrorMessage(t`Unsupported network.`)
      } else if (err.status === 400) {
        setErrorMessage(t`Invalid request.`)
      } else {
        setErrorMessage(err.message || t`Unable to create affiliate code.`)
      }
    } finally {
      setSubmitting(false)
    }
  }, [account, availability, createAffiliateCode, isCodeValid, isMainnet, normalizedCode, provider, setErrorMessage])

  const onInputChange = useCallback(
    (event: FormEvent<HTMLInputElement>) => {
      setHasEdited(true)
      setErrorMessage(null)
      setInputCode(event.currentTarget.value.trim().toUpperCase())
    },
    [setErrorMessage],
  )

  const onGenerate = useCallback(() => {
    setHasEdited(true)
    setErrorMessage(null)
    setInputCode(generateSuggestedCode())
  }, [setErrorMessage])

  const onOpenQr = useCallback(() => {
    if (!existingCode) {
      setErrorMessage(t`Referral link unavailable.`)
      return
    }
    openQrModal()
  }, [existingCode, openQrModal, setErrorMessage])

  const onDismissQr = useCallback(() => closeQrModal(), [closeQrModal])

  const onDownloadQr = useCallback(
    (fileType: 'png' | 'jpg' | 'webp') => {
      if (!qrCodeRef.current || !existingCode) {
        return
      }
      qrCodeRef.current.download(fileType, 'cow-referral')
    },
    [existingCode],
  )

  const referralLink = useMemo(() => {
    if (!existingCode) {
      return ''
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://swap.cow.fi'
    return `${origin}?ref=${existingCode}`
  }, [existingCode])

  return {
    inputRef,
    qrCodeRef,
    inputCode,
    referralLink,
    availability,
    canSave: showCreateForm && isCodeValid && availability === 'available' && !submitting,
    submitting,
    isQrOpen,
    onCreate,
    onInputChange,
    onGenerate,
    onOpenQr,
    onDismissQr,
    onDownloadQr,
  }
}
