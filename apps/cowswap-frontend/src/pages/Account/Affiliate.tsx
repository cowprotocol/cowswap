import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import EARN_AS_AFFILIATE_ILLUSTRATION from '@cowprotocol/assets/images/earn-as-affiliate.svg'
import LockedIcon from '@cowprotocol/assets/images/icon-locked-2.svg'
import ICON_QR_CODE from '@cowprotocol/assets/images/icon-qr-code.svg'
import ICON_SOCIAL_X from '@cowprotocol/assets/images/icon-social-x.svg'
import COW_LOGO_ACCENT from '@cowprotocol/assets/images/logo-icon-cow-circle-accent.svg'
import COW_LOGO_BLACK from '@cowprotocol/assets/images/logo-icon-cow-circle-black.svg'
import COW_LOGO_WHITE from '@cowprotocol/assets/images/logo-icon-cow-circle-white.svg'
import { PAGE_TITLES } from '@cowprotocol/common-const'
import { useTimeAgo } from '@cowprotocol/common-hooks'
import { delay, formatDateWithTimezone, formatShortDate } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ButtonPrimary, ButtonSize, HelpTooltip, ModalHeader, UI } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useLingui } from '@lingui/react/macro'
import { RotateCw } from 'react-feather'
import SVG from 'react-inlinesvg'
import QRCode from 'react-qrcode-logo'
import styled from 'styled-components/macro'

import CopyHelper from 'legacy/components/Copy'
import { useToggleWalletModal } from 'legacy/state/application/hooks'

import { bffAffiliateApi } from 'modules/affiliate/api/bffAffiliateApi'
import {
  buildPartnerTypedData,
  formatUsdcCompact,
  formatUsdCompact,
  generateSuggestedCode,
  isReferralCodeLengthValid,
  sanitizeReferralCode,
} from 'modules/affiliate/lib/affiliate-program-utils'
import { PartnerCodeResponse, PartnerStatsResponse } from 'modules/affiliate/model/partner-trader-types'
import {
  BottomMetaRow,
  CardTitle,
  Donut,
  DonutValue,
  Form,
  HelperText,
  InlineError,
  Label,
  LabelActions,
  LabelRow,
  LinkedActionButton,
  LinkedActionIcon,
  LinkedActions,
  LinkedBadge,
  LinkedCard,
  LinkedCodeRow,
  LinkedCodeText,
  LinkedCopy,
  LinkedFooter,
  LinkedFooterNote,
  LinkedLinkRow,
  LinkedLinkText,
  MiniAction,
  PrimaryAction,
  RewardsCol1Card,
  RewardsCol2Card,
  MetricItem,
  RewardsMetricsList,
  RewardsMetricsRow,
  RewardsThreeColumnGrid,
  HeroActions,
  HeroCard,
  HeroContent,
  HeroSubtitle,
  HeroTitle,
  InlineNote,
  AffiliateTermsFaqLinks,
  NextPayoutCard,
  RewardsWrapper,
  LabelContent,
  TitleWithTooltip,
  StatusText,
  LinkedMetaList,
} from 'modules/affiliate/ui/shared'
import { PartnerReferralCodeInputRow, type TrailingIconKind } from 'modules/affiliate/ui/TraderReferralCodeInput'
import { PageTitle } from 'modules/application/containers/PageTitle'

import { useModalState } from 'common/hooks/useModalState'
import { useOnSelectNetwork } from 'common/hooks/useOnSelectNetwork'
import { CowModal } from 'common/pure/Modal'

const MIN_LOADING_MS = 200

const QR_SIZE_PX = 220
const QR_LOGO_SIZE_PX = 64
const EMPTY_VALUE_LABEL = '-'

const QR_COLORS: Record<QrColor, { label: string; fg: string; bg: string }> = {
  black: { label: 'Black', fg: '#111111', bg: '#FFFFFF' },
  white: { label: 'White', fg: '#FFFFFF', bg: '#111111' },
  accent: { label: 'Accent', fg: '#1f5bd6', bg: '#FFFFFF' },
}

const QR_LOGOS: Record<QrColor, string> = {
  black: COW_LOGO_BLACK,
  white: COW_LOGO_WHITE,
  accent: COW_LOGO_ACCENT,
}

type AvailabilityState = 'idle' | 'invalid' | 'checking' | 'available' | 'unavailable' | 'error'
type QrColor = 'black' | 'white' | 'accent'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, max-lines-per-function, complexity
export default function AccountAffiliate() {
  const { i18n } = useLingui()
  const { account, chainId } = useWalletInfo()
  const provider = useWalletProvider()
  const toggleWalletModal = useToggleWalletModal()
  const onSelectNetwork = useOnSelectNetwork()
  const isMainnet = useMemo(() => chainId === SupportedChainId.MAINNET, [chainId])

  const [codeLoading, setCodeLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [existingCode, setExistingCode] = useState<string | null>(null)
  const [inputCode, setInputCode] = useState('')
  const [availability, setAvailability] = useState<AvailabilityState>('idle')
  const [hasEdited, setHasEdited] = useState(false)
  const [createdAt, setCreatedAt] = useState<Date | null>(null)
  const [programParams, setProgramParams] = useState<PartnerCodeResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [partnerStats, setPartnerStats] = useState<PartnerStatsResponse | null>(null)
  const [statsUpdatedAt, setStatsUpdatedAt] = useState<Date | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const { isModalOpen: isQrOpen, openModal: openQrModal, closeModal: closeQrModal } = useModalState()
  const [qrColor, setQrColor] = useState<QrColor>('accent')
  const qrCodeRef = useRef<QRCode | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const normalizedCode = useMemo(() => sanitizeReferralCode(inputCode), [inputCode])
  const hasInvalidChars = useMemo(() => inputCode.trim().toUpperCase() !== normalizedCode, [inputCode, normalizedCode])
  const isCodeValid = useMemo(
    () => isReferralCodeLengthValid(normalizedCode) && !hasInvalidChars,
    [hasInvalidChars, normalizedCode],
  )
  const codeTooltip = t`Referral codes contain 5-20 uppercase letters, numbers, dashes, or underscores`
  const referralTrafficTooltip = t`Donut chart tracks eligible volume left to unlock the next reward.`
  const numberFormatter = useMemo(() => new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }), [])
  const formatNumber = useCallback(
    (value: number | null | undefined) => (value === null || value === undefined ? '-' : numberFormatter.format(value)),
    [numberFormatter],
  )
  const formatUpdatedAt = useCallback((value: Date | null) => {
    if (!value) {
      return '-'
    }

    return formatDateWithTimezone(value) ?? '-'
  }, [])

  const isConnected = Boolean(account)
  const isSignerAvailable = Boolean(provider)
  const showCreateForm = isConnected && isMainnet && !existingCode && isSignerAvailable
  const showLinkedFlow = isConnected && isMainnet && Boolean(existingCode)
  const showUnsupported = isConnected && !isMainnet

  const referralLink = useMemo(() => {
    if (!existingCode) {
      return ''
    }

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://swap.cow.fi'
    return `${origin}?ref=${existingCode}`
  }, [existingCode])

  const shareText = useMemo(() => {
    if (!existingCode) {
      return ''
    }

    return encodeURIComponent(`Trade on CoW Swap with my referral code ${existingCode}. ${referralLink} @CoWSwap`)
  }, [existingCode, referralLink])

  const qrPalette = useMemo(() => QR_COLORS[qrColor], [qrColor])
  const qrError = !referralLink ? t`Referral link unavailable.` : null
  const canDownloadQr = Boolean(referralLink)

  const handleDownloadQr = useCallback(
    (fileType: 'png' | 'jpg' | 'webp') => {
      if (!qrCodeRef.current || !canDownloadQr) {
        return
      }

      qrCodeRef.current.download(fileType, 'cow-referral')
    },
    [canDownloadQr],
  )

  useEffect(() => {
    let cancelled = false

    if (!account || !isMainnet) {
      setExistingCode(null)
      setCreatedAt(null)
      setCodeLoading(false)
      setPartnerStats(null)
      setStatsUpdatedAt(null)
      setProgramParams(null)
      return
    }

    const loadCode = async (): Promise<void> => {
      setCodeLoading(true)
      setErrorMessage(null)

      try {
        const [response] = await Promise.all([bffAffiliateApi.getAffiliateCode(account), delay(MIN_LOADING_MS)])
        if (cancelled) {
          return
        }

        if (response?.code) {
          setStatsLoading(true)
          setExistingCode(response.code)
          const created = response.createdAt ? new Date(response.createdAt) : null
          setCreatedAt(created && !Number.isNaN(created.getTime()) ? created : null)
          setProgramParams(response)
        } else {
          setExistingCode(null)
          setCreatedAt(null)
          setProgramParams(null)
          setStatsLoading(false)
        }
      } catch {
        if (cancelled) {
          return
        }
        setExistingCode(null)
        setCreatedAt(null)
        setProgramParams(null)
        setStatsLoading(false)
        setErrorMessage(t`Unable to reach the affiliate service.`)
      }

      setCodeLoading(false)
    }

    loadCode()

    return () => {
      cancelled = true
    }
  }, [account, isMainnet])

  useEffect(() => {
    let cancelled = false

    if (!account || !isMainnet || !existingCode) {
      setPartnerStats(null)
      setStatsUpdatedAt(null)
      setStatsLoading(false)
      return
    }

    const loadStats = async (): Promise<void> => {
      setStatsLoading(true)
      try {
        const [stats] = await Promise.all([bffAffiliateApi.getAffiliateStats(account), delay(MIN_LOADING_MS)])
        if (cancelled) {
          return
        }

        setPartnerStats(stats)
        const updated = stats?.lastUpdatedAt ? new Date(stats.lastUpdatedAt) : null
        setStatsUpdatedAt(updated && !Number.isNaN(updated.getTime()) ? updated : null)
      } catch {
        if (cancelled) {
          return
        }
        setPartnerStats(null)
        setStatsUpdatedAt(null)
      }

      setStatsLoading(false)
    }

    loadStats()

    return () => {
      cancelled = true
    }
  }, [account, existingCode, isMainnet])

  useEffect(() => {
    if (!showCreateForm || hasEdited || inputCode) {
      return
    }

    const suggested = generateSuggestedCode()
    setInputCode(suggested)
  }, [account, hasEdited, inputCode, showCreateForm])

  useEffect(() => {
    if (!showCreateForm) {
      setAvailability('idle')
      return
    }

    if (!inputCode) {
      setAvailability('idle')
      return
    }

    if (!isCodeValid) {
      setAvailability('invalid')
      return
    }

    if (!chainId) {
      setAvailability('idle')
      return
    }

    let active = true
    setAvailability('checking')

    const timer = setTimeout(() => {
      bffAffiliateApi
        .verifyReferralCode({
          code: normalizedCode,
          account: account || '0x0000000000000000000000000000000000000000',
          chainId,
        })
        .then((response) => {
          if (!active) {
            return
          }

          if (response.ok) {
            setAvailability('unavailable')
            return
          }

          if (response.status === 404) {
            setAvailability('available')
            return
          }

          if (response.status === 403) {
            setAvailability('unavailable')
            return
          }

          setAvailability('error')
        })
        .catch(() => {
          if (active) {
            setAvailability('error')
          }
        })
    }, 350)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [account, chainId, inputCode, isCodeValid, normalizedCode, showCreateForm])

  // eslint-disable-next-line complexity
  const handleCreate = useCallback(async () => {
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

    if (availability !== 'available') {
      if (availability === 'unavailable' || availability === 'error') {
        setErrorMessage(t`That code is unavailable. Try another.`)
      }

      return
    }

    if (!provider) {
      setErrorMessage(t`Wallet signer unavailable.`)
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

      const response = await bffAffiliateApi.createAffiliateCode({
        code: normalizedCode,
        walletAddress: account,
        signedMessage,
      })

      setExistingCode(response.code)
      const created = response.createdAt ? new Date(response.createdAt) : null
      setCreatedAt(created && !Number.isNaN(created.getTime()) ? created : null)
      setProgramParams(response)
    } catch (error) {
      const err = error as Error & { status?: number; code?: number }

      if (err.code === 4001) {
        setErrorMessage(t`Signature request rejected.`)
      } else if (err.status === 409) {
        setAvailability('unavailable')
        setErrorMessage(t`Code already taken or wallet already linked.`)
      } else if (err.status === 401) {
        setErrorMessage(t`Signature invalid. Please try again.`)
      } else if (err.status === 403) {
        setAvailability('unavailable')
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
  }, [account, availability, isCodeValid, isMainnet, normalizedCode, provider])

  const handleConnect = useCallback(() => {
    toggleWalletModal()
  }, [toggleWalletModal])

  const handleSwitchToMainnet = useCallback(() => {
    onSelectNetwork(SupportedChainId.MAINNET)
  }, [onSelectNetwork])

  const handleInputChange = useCallback((event: FormEvent<HTMLInputElement>) => {
    setHasEdited(true)
    setErrorMessage(null)
    setInputCode(event.currentTarget.value.toUpperCase())
  }, [])

  const handleGenerate = useCallback(() => {
    setHasEdited(true)
    setErrorMessage(null)
    setInputCode(generateSuggestedCode())
  }, [])

  const handleOpenQr = useCallback(() => {
    if (!referralLink) {
      setErrorMessage(t`Referral link unavailable.`)
      return
    }

    openQrModal()
  }, [openQrModal, referralLink])

  const canSave = showCreateForm && isCodeValid && availability === 'available' && !submitting
  const showCodeUnavailable = availability === 'unavailable'
  const showInvalidFormat = availability === 'invalid'
  const trailingIconKind: TrailingIconKind | undefined =
    availability === 'checking'
      ? 'pending'
      : availability === 'available'
        ? 'success'
        : availability === 'unavailable' || availability === 'invalid' || availability === 'error'
          ? 'error'
          : undefined
  const statsReady = Boolean(partnerStats)
  const statsLoadingCombined = statsLoading || codeLoading
  const triggerVolume = typeof programParams?.triggerVolume === 'number' ? programParams.triggerVolume : null
  const leftToNextReward = statsReady ? partnerStats?.left_to_next_reward : undefined

  const progressToNextReward =
    triggerVolume !== null && leftToNextReward !== undefined ? Math.max(triggerVolume - leftToNextReward, 0) : 0
  const referralTrafficPercent = triggerVolume
    ? Math.min(100, Math.round((progressToNextReward / triggerVolume) * 100))
    : 0

  const progressToNextRewardLabel =
    triggerVolume !== null ? formatUsdCompact(progressToNextReward) : formatUsdCompact(0)
  const hasTriggerVolume = triggerVolume !== null
  const triggerVolumeLabel = hasTriggerVolume ? formatUsdCompact(triggerVolume) : formatUsdCompact(0)
  const affiliateRewardAmount =
    typeof programParams?.rewardAmount === 'number' && typeof programParams?.revenueSplitAffiliatePct === 'number'
      ? programParams.rewardAmount * (programParams.revenueSplitAffiliatePct / 100)
      : null
  const rewardAmountLabel = affiliateRewardAmount !== null ? formatUsdCompact(affiliateRewardAmount) : 'reward'

  const nextPayoutLabel = statsReady ? formatUsdcCompact(partnerStats?.next_payout) : formatUsdcCompact(0)
  const totalEarnedLabel = statsReady ? formatUsdcCompact(partnerStats?.total_earned) : EMPTY_VALUE_LABEL
  const paidOutLabel = statsReady ? formatUsdcCompact(partnerStats?.paid_out) : EMPTY_VALUE_LABEL
  const leftToNextRewardLabel = statsReady ? formatUsdCompact(partnerStats?.left_to_next_reward) : EMPTY_VALUE_LABEL
  const totalVolumeLabel = statsReady ? formatUsdCompact(partnerStats?.total_volume) : EMPTY_VALUE_LABEL
  const activeReferralsLabel = statsReady ? formatNumber(partnerStats?.active_traders) : EMPTY_VALUE_LABEL

  const showHero = !isConnected || showUnsupported || (isConnected && !isSignerAvailable && !showLinkedFlow)

  const createdOnLabel = createdAt ? formatShortDate(createdAt) : '-'
  const statsUpdatedLabel = useTimeAgo(statsUpdatedAt ?? undefined, 60_000)
  const statsUpdatedAbsoluteLabel = formatUpdatedAt(statsUpdatedAt)
  const statsUpdatedDisplay = statsUpdatedLabel || '-'
  const statsUpdatedText = i18n._(t`Last updated: ${statsUpdatedDisplay}`)
  const statsUpdatedTitle = statsUpdatedAbsoluteLabel !== '-' ? statsUpdatedAbsoluteLabel : undefined

  return (
    <RewardsWrapper>
      <PageTitle title={i18n._(PAGE_TITLES.AFFILIATE)} />

      {showHero ? (
        <HeroCard>
          <HeroContent>
            <img src={EARN_AS_AFFILIATE_ILLUSTRATION} alt="" role="presentation" />
            <HeroTitle>
              <Trans>
                Invite your friends <br /> and earn rewards
              </Trans>
            </HeroTitle>
            <HeroSubtitle>
              <Trans>
                You and your referrals can earn a flat fee <br /> for the eligible volume done through the app. link.
              </Trans>
            </HeroSubtitle>
            <HeroActions>
              {!isConnected && (
                <ButtonPrimary buttonSize={ButtonSize.BIG} onClick={handleConnect} data-testid="affiliate-connect">
                  <Trans>Connect wallet</Trans>
                </ButtonPrimary>
              )}
              {isConnected && showUnsupported && (
                <ButtonPrimary buttonSize={ButtonSize.BIG} onClick={handleSwitchToMainnet}>
                  <Trans>Switch to Ethereum</Trans>
                </ButtonPrimary>
              )}
              {isConnected && !showUnsupported && !isSignerAvailable && !showLinkedFlow && (
                <ButtonPrimary onClick={handleConnect} data-testid="affiliate-unlock">
                  <Trans>Become an affiliate</Trans>
                </ButtonPrimary>
              )}
            </HeroActions>
            <AffiliateTermsFaqLinks />
            {showUnsupported && (
              <InlineNote>
                <Trans>Affiliate payouts and registration happens on Ethereum mainnet.</Trans>
              </InlineNote>
            )}
          </HeroContent>
        </HeroCard>
      ) : (
        <>
          <RewardsThreeColumnGrid>
            <RewardsCol1Card showLoader={codeLoading}>
              {showLinkedFlow && existingCode ? (
                <>
                  <CardTitle>
                    <Trans>Your referral code</Trans>
                  </CardTitle>
                  <LinkedCard>
                    <LinkedCodeRow>
                      <LinkedCopy>
                        <CopyHelper toCopy={existingCode} iconSize={16} hideCopiedLabel />
                        <LinkedCodeText>{existingCode}</LinkedCodeText>
                      </LinkedCopy>
                      <LinkedBadge>
                        <SVG src={LockedIcon} width={12} height={10} />
                        <Trans>Created</Trans>
                      </LinkedBadge>
                    </LinkedCodeRow>
                    <LinkedLinkRow>
                      <LinkedCopy>
                        <CopyHelper toCopy={referralLink} iconSize={16} hideCopiedLabel />
                        <LinkedLinkText>{referralLink}</LinkedLinkText>
                      </LinkedCopy>
                    </LinkedLinkRow>
                  </LinkedCard>

                  <LinkedMetaList>
                    <MetricItem>
                      <span>
                        <Trans>Created on</Trans>
                      </span>
                      <strong>{createdOnLabel}</strong>
                    </MetricItem>
                  </LinkedMetaList>

                  <LinkedFooter>
                    <LinkedFooterNote>
                      <Trans>Links/codes don't reveal your wallet.</Trans>
                    </LinkedFooterNote>
                    <LinkedActions>
                      <LinkedActionButton
                        as="a"
                        href={`https://twitter.com/intent/tweet?text=${shareText}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <LinkedActionIcon>
                          <SVG src={ICON_SOCIAL_X} width={14} height={14} />
                        </LinkedActionIcon>
                        <Trans>Share on X</Trans>
                      </LinkedActionButton>
                      <LinkedActionButton onClick={handleOpenQr}>
                        <LinkedActionIcon>
                          <SVG src={ICON_QR_CODE} width={14} height={14} />
                        </LinkedActionIcon>
                        <Trans>Download QR</Trans>
                      </LinkedActionButton>
                    </LinkedActions>
                  </LinkedFooter>
                </>
              ) : (
                <>
                  <CardTitle>
                    <Trans>Create your referral code</Trans>
                  </CardTitle>
                  <HelperText>
                    <Trans>
                      Type or generate a code (subject to availability). Saving locks this code to your wallet and can't
                      be changed. Links/codes don't reveal your wallet.
                    </Trans>
                  </HelperText>
                  <BottomMetaRow>
                    <Form>
                      <LabelRow>
                        <Label htmlFor="affiliate-code">
                          <LabelContent>
                            <Trans>Referral code</Trans>
                            <HelpTooltip text={codeTooltip} />
                          </LabelContent>
                        </Label>
                        <LabelActions>
                          <MiniAction onClick={handleGenerate} disabled={submitting}>
                            <Trans>generate</Trans>
                            <RotateCw size={10} strokeWidth={3} />
                          </MiniAction>
                        </LabelActions>
                      </LabelRow>
                      <PartnerReferralCodeInputRow
                        displayCode={inputCode}
                        hasError={showInvalidFormat || showCodeUnavailable || availability === 'error'}
                        isInputDisabled={submitting}
                        isEditing
                        isLinked={false}
                        trailingIconKind={trailingIconKind}
                        canSubmitSave={canSave}
                        onChange={handleInputChange}
                        onPrimaryClick={handleCreate}
                        onSave={handleCreate}
                        inputRef={inputRef}
                        isLoading={availability === 'checking'}
                        inputId="affiliate-code"
                        placeholder={t`Enter your code`}
                        size="compact"
                        trailingIconLabels={{
                          pending: <Trans>Checking</Trans>,
                          success: <Trans>Available</Trans>,
                        }}
                        trailingIconTitles={{
                          pending: t`Checking`,
                          success: t`Available`,
                        }}
                      />
                      {showCodeUnavailable && (
                        <InlineError>
                          <Trans>This code is taken. Generate another one.</Trans>
                        </InlineError>
                      )}
                      {showInvalidFormat && (
                        <InlineError>
                          <Trans>Only A-Z, 0-9, dashes, and underscores are allowed.</Trans>
                        </InlineError>
                      )}
                      <PrimaryAction onClick={handleCreate} disabled={!canSave} data-testid="affiliate-start-confirm">
                        {submitting ? t`Signing...` : t`Save & lock code`}
                      </PrimaryAction>
                      {errorMessage && <StatusText $variant="error">{errorMessage}</StatusText>}
                    </Form>
                  </BottomMetaRow>
                </>
              )}
            </RewardsCol1Card>

            <RewardsCol2Card showLoader={statsLoadingCombined}>
              <CardTitle>
                <TitleWithTooltip>
                  <span>
                    <Trans>Your referral traffic</Trans>
                  </span>
                  <HelpTooltip text={referralTrafficTooltip} />
                </TitleWithTooltip>
              </CardTitle>
              <RewardsMetricsRow>
                <RewardsMetricsList>
                  <MetricItem>
                    <LabelContent>
                      <Trans>Left to next {rewardAmountLabel}</Trans>
                      <HelpTooltip text={referralTrafficTooltip} />
                    </LabelContent>
                    <strong>{leftToNextRewardLabel}</strong>
                  </MetricItem>
                  <MetricItem>
                    <span>
                      <Trans>Total earned</Trans>
                    </span>
                    <strong>{totalEarnedLabel}</strong>
                  </MetricItem>
                  <MetricItem>
                    <span>
                      <Trans>Received</Trans>
                    </span>
                    <strong>{paidOutLabel}</strong>
                  </MetricItem>
                  <MetricItem>
                    <span>
                      <Trans>Volume referred</Trans>
                    </span>
                    <strong>{totalVolumeLabel}</strong>
                  </MetricItem>
                  <MetricItem>
                    <span>
                      <Trans>Active referrals</Trans>
                    </span>
                    <strong>{activeReferralsLabel}</strong>
                  </MetricItem>
                </RewardsMetricsList>

                <Donut $value={referralTrafficPercent}>
                  <DonutValue>
                    <span>{progressToNextRewardLabel}</span>
                    {hasTriggerVolume && (
                      <small>
                        <Trans>of</Trans> {triggerVolumeLabel}
                      </small>
                    )}
                  </DonutValue>
                </Donut>
              </RewardsMetricsRow>
              <BottomMetaRow>
                <span title={statsUpdatedTitle}>{statsUpdatedText}</span>
              </BottomMetaRow>
            </RewardsCol2Card>
            <NextPayoutCard payoutLabel={nextPayoutLabel} showLoader={statsLoadingCombined} />
          </RewardsThreeColumnGrid>

          <AffiliateTermsFaqLinks align="center" />
        </>
      )}

      <CowModal isOpen={isQrOpen} onDismiss={closeQrModal}>
        <ModalContent>
          <ModalHeader onClose={closeQrModal}>
            <Trans>Download referral QR code</Trans>
          </ModalHeader>
          <ModalBody>
            <QrUrl>{referralLink}</QrUrl>
            <QrFrame $bg={qrPalette.bg}>
              {referralLink ? (
                <QRCode
                  ref={qrCodeRef}
                  value={referralLink}
                  size={QR_SIZE_PX}
                  quietZone={2}
                  bgColor={qrPalette.bg}
                  fgColor={qrPalette.fg}
                  logoImage={QR_LOGOS[qrColor]}
                  logoWidth={QR_LOGO_SIZE_PX}
                  logoHeight={QR_LOGO_SIZE_PX}
                  logoPadding={0}
                  logoPaddingStyle="circle"
                  removeQrCodeBehindLogo
                  eyeRadius={0}
                />
              ) : (
                <QrPlaceholder />
              )}
            </QrFrame>
            {qrError && <InlineError>{qrError}</InlineError>}
            <QrPalette>
              {Object.entries(QR_COLORS).map(([key, color]) => (
                <ColorDot
                  key={key}
                  type="button"
                  $active={qrColor === key}
                  $color={color.fg}
                  onClick={() => setQrColor(key as QrColor)}
                  aria-label={color.label}
                />
              ))}
            </QrPalette>
            <QrActions>
              <DownloadLink
                href="#"
                $disabled={!canDownloadQr}
                onClick={(event) => {
                  event.preventDefault()
                  handleDownloadQr('png')
                }}
              >
                <Trans>Download .PNG</Trans>
              </DownloadLink>
              <DownloadLink
                href="#"
                $disabled={!canDownloadQr}
                onClick={(event) => {
                  event.preventDefault()
                  handleDownloadQr('webp')
                }}
              >
                <Trans>Download .WEBP</Trans>
              </DownloadLink>
            </QrActions>
          </ModalBody>
        </ModalContent>
      </CowModal>
    </RewardsWrapper>
  )
}

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 10px;
`

const QrUrl = styled.p`
  margin: 0 auto;
  font-size: 13px;
  color: var(${UI.COLOR_TEXT_OPACITY_60});
  word-break: break-all;
`

const QrFrame = styled.div<{ $bg: string }>`
  border-radius: 16px;
  border: 1px solid var(${UI.COLOR_PAPER_DARKER});
  background: ${({ $bg }) => $bg};
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
`

const QrPlaceholder = styled.div`
  width: ${QR_SIZE_PX}px;
  height: ${QR_SIZE_PX}px;
  border-radius: 12px;
  background: repeating-linear-gradient(
    45deg,
    var(${UI.COLOR_PAPER}) 0,
    var(${UI.COLOR_PAPER}) 12px,
    var(${UI.COLOR_PAPER_DARKER}) 12px,
    var(${UI.COLOR_PAPER_DARKER}) 24px
  );
`

const QrPalette = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`

const ColorDot = styled.button<{ $active: boolean; $color: string }>`
  width: 24px;
  height: 24px;
  border-radius: 999px;
  border: 4px solid ${({ $active }) => ($active ? `var(${UI.COLOR_PRIMARY})` : `var(${UI.COLOR_BORDER})`)};
  background: ${({ $color }) => $color};
  cursor: pointer;
`

const QrActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`

const DownloadLink = styled.a<{ $disabled: boolean }>`
  padding: 10px 16px;
  border-radius: 12px;
  border: 1px solid var(${UI.COLOR_BORDER});
  text-decoration: none;
  color: ${({ $disabled }) => ($disabled ? `var(${UI.COLOR_TEXT_OPACITY_50})` : `var(${UI.COLOR_TEXT_OPACITY_60})`)};
  pointer-events: ${({ $disabled }) => ($disabled ? 'none' : 'auto')};
`
