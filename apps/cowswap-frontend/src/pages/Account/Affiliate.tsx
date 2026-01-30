import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import EARN_AS_AFFILIATE_ILLUSTRATION from '@cowprotocol/assets/images/earn-as-affiliate.svg'
import { PAGE_TITLES } from '@cowprotocol/common-const'
import { useTimeAgo } from '@cowprotocol/common-hooks'
import { formatDateWithTimezone, formatShortDate } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ButtonPrimary, ButtonSecondary, ButtonSize, HelpTooltip, UI } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useLingui } from '@lingui/react/macro'
import { toDataURL, toString } from 'qrcode'
import { Grid, Lock, X } from 'react-feather'
import styled from 'styled-components/macro'

import CopyHelper from 'legacy/components/Copy'
import { useToggleWalletModal } from 'legacy/state/application/hooks'

import { bffAffiliateApi } from 'modules/affiliate/api'
import {
  buildAffiliateTypedData,
  isReferralCodeLengthValid,
  sanitizeReferralCode,
} from 'modules/affiliate/lib/affiliate-program-utils'
import { AffiliateStatsResponse } from 'modules/affiliate/model/types'
import { ReferralCodeInputRow, type TrailingIconKind } from 'modules/affiliate/ui/ReferralCodeInput'
import {
  BottomMetaRow,
  CardHeader,
  CardTitle,
  Donut,
  DonutValue,
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
  MetaRow,
  ReferralTermsFaqLinks,
  RewardsPayoutCard,
  RewardsWrapper,
} from 'modules/affiliate/ui/shared'
import { PageTitle } from 'modules/application/containers/PageTitle'

import { useModalState } from 'common/hooks/useModalState'
import { useOnSelectNetwork } from 'common/hooks/useOnSelectNetwork'
import { CowModal } from 'common/pure/Modal'
import { CardsLoader, CardsSpinner } from 'pages/Account/styled'

const QR_SIZE_PX = 220
const DEFAULT_REWARDS_TARGET = 50_000
const EMPTY_VALUE_LABEL = '-'

const QR_COLORS: Record<QrColor, { label: string; dark: string; light: string }> = {
  black: { label: 'Black', dark: '#111111', light: '#FFFFFF' },
  navy: { label: 'Navy', dark: '#123a78', light: '#FFFFFF' },
  blue: { label: 'Blue', dark: '#1f5bd6', light: '#FFFFFF' },
}

type AvailabilityState = 'idle' | 'invalid' | 'checking' | 'available' | 'unavailable' | 'error'
type QrColor = 'black' | 'navy' | 'blue'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, max-lines-per-function, complexity
export default function AccountAffiliate() {
  const { i18n } = useLingui()
  const { account, chainId } = useWalletInfo()
  const provider = useWalletProvider()
  const toggleWalletModal = useToggleWalletModal()
  const onSelectNetwork = useOnSelectNetwork()
  const isMainnet = useMemo(() => chainId === SupportedChainId.MAINNET, [chainId])

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [existingCode, setExistingCode] = useState<string | null>(null)
  const [inputCode, setInputCode] = useState('')
  const [availability, setAvailability] = useState<AvailabilityState>('idle')
  const [hasEdited, setHasEdited] = useState(false)
  const [createdAt, setCreatedAt] = useState<Date | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [affiliateStats, setAffiliateStats] = useState<AffiliateStatsResponse | null>(null)
  const [statsUpdatedAt, setStatsUpdatedAt] = useState<Date | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const { isModalOpen: isQrOpen, openModal: openQrModal, closeModal: closeQrModal } = useModalState()
  const [qrColor, setQrColor] = useState<QrColor>('navy')
  const [qrPngUrl, setQrPngUrl] = useState<string | null>(null)
  const [qrSvgUrl, setQrSvgUrl] = useState<string | null>(null)
  const [qrError, setQrError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const normalizedCode = useMemo(() => sanitizeReferralCode(inputCode), [inputCode])
  const hasInvalidChars = useMemo(() => inputCode.trim().toUpperCase() !== normalizedCode, [inputCode, normalizedCode])
  const isCodeValid = useMemo(
    () => isReferralCodeLengthValid(normalizedCode) && !hasInvalidChars,
    [hasInvalidChars, normalizedCode],
  )
  const codeTooltip = t`Referral codes contain 5-20 uppercase letters, numbers, dashes, or underscores`
  const numberFormatter = useMemo(() => new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }), [])
  const compactFormatter = useMemo(
    () => new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }),
    [],
  )
  const formatUsdCompact = useCallback(
    (value: number | null | undefined) =>
      value === null || value === undefined ? '-' : `$${compactFormatter.format(value)}`,
    [compactFormatter],
  )
  const formatUsdcCompact = useCallback(
    (value: number | null | undefined) =>
      value === null || value === undefined ? '-' : `${compactFormatter.format(value)} USDC`,
    [compactFormatter],
  )
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

  useEffect(() => {
    if (!isQrOpen) {
      setQrError(null)
      return
    }

    if (!referralLink) {
      setQrError(t`Referral link unavailable.`)
      setQrPngUrl(null)
      setQrSvgUrl(null)
      return
    }

    let active = true
    setQrError(null)

    const palette = QR_COLORS[qrColor]
    const options = {
      margin: 1,
      width: QR_SIZE_PX,
      color: { dark: palette.dark, light: palette.light },
    }

    Promise.all([toDataURL(referralLink, options), toString(referralLink, { ...options, type: 'svg' })])
      .then(([pngUrl, svgText]) => {
        if (!active) {
          return
        }

        setQrPngUrl(pngUrl)
        setQrSvgUrl(`data:image/svg+xml;utf8,${encodeURIComponent(svgText)}`)
      })
      .catch(() => {
        if (!active) {
          return
        }

        setQrError(t`Unable to generate QR code.`)
        setQrPngUrl(null)
        setQrSvgUrl(null)
      })

    return () => {
      active = false
    }
  }, [isQrOpen, qrColor, referralLink])

  useEffect(() => {
    let cancelled = false

    if (!account || !isMainnet) {
      setExistingCode(null)
      setCreatedAt(null)
      setLoading(false)
      setAffiliateStats(null)
      setStatsUpdatedAt(null)
      return
    }

    setLoading(true)
    setErrorMessage(null)

    bffAffiliateApi
      .getAffiliateCode(account)
      .then((response) => {
        if (cancelled) {
          return
        }

        if (response?.code) {
          setExistingCode(response.code)
          const created = response.createdAt ? new Date(response.createdAt) : null
          setCreatedAt(created && !Number.isNaN(created.getTime()) ? created : null)
        } else {
          setExistingCode(null)
          setCreatedAt(null)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setExistingCode(null)
          setCreatedAt(null)
          setErrorMessage(t`Unable to load affiliate code right now.`)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [account, isMainnet])

  useEffect(() => {
    let cancelled = false

    if (!account || !isMainnet || !existingCode) {
      setAffiliateStats(null)
      setStatsUpdatedAt(null)
      setStatsLoading(false)
      return
    }

    setStatsLoading(true)
    bffAffiliateApi
      .getAffiliateStats(account)
      .then((stats) => {
        if (cancelled) {
          return
        }

        setAffiliateStats(stats)
        const updated = stats?.lastUpdatedAt ? new Date(stats.lastUpdatedAt) : null
        setStatsUpdatedAt(updated && !Number.isNaN(updated.getTime()) ? updated : null)
      })
      .catch(() => {
        if (!cancelled) {
          setAffiliateStats(null)
          setStatsUpdatedAt(null)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setStatsLoading(false)
        }
      })

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
    setSuccessMessage(null)

    try {
      const signer = provider.getSigner()
      const typedData = buildAffiliateTypedData({
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
      setSuccessMessage(t`Affiliate code created.`)
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
    setSuccessMessage(null)
    setInputCode(event.currentTarget.value.toUpperCase())
  }, [])

  const handleGenerate = useCallback(() => {
    setHasEdited(true)
    setErrorMessage(null)
    setSuccessMessage(null)
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
  const statsReady = Boolean(affiliateStats)
  const referralTarget = affiliateStats?.trigger_volume ?? DEFAULT_REWARDS_TARGET
  const leftToNextReward = affiliateStats?.left_to_next_reward

  const progressToNextReward =
    statsReady && leftToNextReward !== undefined ? Math.max(referralTarget - leftToNextReward, 0) : 0
  const referralTrafficPercent =
    referralTarget > 0 ? Math.min(100, Math.round((progressToNextReward / referralTarget) * 100)) : 0

  const progressToNextRewardLabel = formatUsdCompact(progressToNextReward)
  const referralTargetLabel = formatUsdCompact(referralTarget)

  const nextPayoutLabel = statsReady ? formatUsdcCompact(affiliateStats?.next_payout) : EMPTY_VALUE_LABEL
  const totalEarnedLabel = statsReady ? formatUsdcCompact(affiliateStats?.total_earned) : EMPTY_VALUE_LABEL
  const paidOutLabel = statsReady ? formatUsdcCompact(affiliateStats?.paid_out) : EMPTY_VALUE_LABEL
  const leftToNextRewardLabel = statsReady ? formatUsdCompact(affiliateStats?.left_to_next_reward) : EMPTY_VALUE_LABEL
  const totalVolumeLabel = statsReady ? formatUsdCompact(affiliateStats?.total_volume) : EMPTY_VALUE_LABEL
  const activeReferralsLabel = statsReady ? formatNumber(affiliateStats?.active_traders) : EMPTY_VALUE_LABEL

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

      {loading ? (
        <CardsLoader>
          <CardsSpinner />
        </CardsLoader>
      ) : (
        <>
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
                    For every $50k eligible volume, <br /> you and the trader each earn $10.
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
                      <Trans>Switch to Ethereum mainnet</Trans>
                    </ButtonPrimary>
                  )}
                  {isConnected && !showUnsupported && !isSignerAvailable && !showLinkedFlow && (
                    <ButtonPrimary onClick={handleConnect} data-testid="affiliate-unlock">
                      <Trans>Become an affiliate</Trans>
                    </ButtonPrimary>
                  )}
                </HeroActions>
                <ReferralTermsFaqLinks />
                {showUnsupported && (
                  <InlineNote>
                    <Trans>Affiliate payouts happen on Ethereum mainnet.</Trans>
                  </InlineNote>
                )}
              </HeroContent>
            </HeroCard>
          ) : (
            <>
              <RewardsThreeColumnGrid>
                <RewardsCol1Card>
                  {showLinkedFlow && existingCode ? (
                    <LinkedBlock>
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
                            <Lock size={14} />
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

                      <MetricItem>
                        <span>
                          <Trans>Created on</Trans>
                        </span>
                        <strong>{createdOnLabel}</strong>
                      </MetricItem>

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
                              <X size={14} />
                            </LinkedActionIcon>
                            <Trans>Share on X</Trans>
                          </LinkedActionButton>
                          <LinkedActionButton onClick={handleOpenQr}>
                            <LinkedActionIcon>
                              <Grid size={14} />
                            </LinkedActionIcon>
                            <Trans>Download QR</Trans>
                          </LinkedActionButton>
                        </LinkedActions>
                      </LinkedFooter>
                    </LinkedBlock>
                  ) : (
                    <Form>
                      <LabelRow>
                        <CardTitle>
                          <Trans>Create your referral code</Trans>
                        </CardTitle>
                      </LabelRow>
                      <HelperText>
                        <Trans>
                          Type or generate a code (subject to availability). Saving locks this code to your wallet and
                          can't be changed. Links/codes don't reveal your wallet.
                        </Trans>
                      </HelperText>
                      <>
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
                            </MiniAction>
                          </LabelActions>
                        </LabelRow>
                        <ReferralCodeInputRow
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
                      </>
                    </Form>
                  )}
                </RewardsCol1Card>

                <RewardsCol2Card showLoader={statsLoading}>
                  <CardHeader>
                    <CardTitle>
                      <Trans>Your referral traffic</Trans>
                    </CardTitle>
                  </CardHeader>
                  <RewardsMetricsRow>
                    <RewardsMetricsList>
                      <MetricItem>
                        <span>
                          <Trans>Left to next $10</Trans>
                        </span>
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
                          <Trans>Claimed</Trans>
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
                        <small>
                          <Trans>of</Trans> {referralTargetLabel}
                        </small>
                      </DonutValue>
                    </Donut>
                  </RewardsMetricsRow>
                  <BottomMetaRow>
                    <span title={statsUpdatedTitle}>{statsUpdatedText}</span>
                  </BottomMetaRow>
                </RewardsCol2Card>
                <RewardsPayoutCard payoutLabel={nextPayoutLabel} showLoader={statsLoading} />
              </RewardsThreeColumnGrid>

              <ReferralTermsFaqLinks align="center" />
            </>
          )}

          {errorMessage && <StatusText $variant="error">{errorMessage}</StatusText>}
          {successMessage && <StatusText $variant="success">{successMessage}</StatusText>}
        </>
      )}

      <CowModal isOpen={isQrOpen} onDismiss={closeQrModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>
              <Trans>Download referral QR code</Trans>
            </ModalTitle>
            <ModalClose onClick={closeQrModal}>×</ModalClose>
          </ModalHeader>
          <ModalBody>
            <QrUrl>{referralLink}</QrUrl>
            <QrFrame>{qrPngUrl ? <QrImage src={qrPngUrl} alt={t`Referral QR code`} /> : <QrPlaceholder />}</QrFrame>
            {qrError && <InlineError>{qrError}</InlineError>}
            <QrPalette>
              {Object.entries(QR_COLORS).map(([key, color]) => (
                <ColorDot
                  key={key}
                  type="button"
                  $active={qrColor === key}
                  $color={color.dark}
                  onClick={() => setQrColor(key as QrColor)}
                  aria-label={color.label}
                />
              ))}
            </QrPalette>
            <QrActions>
              <DownloadLink
                href={qrSvgUrl ?? '#'}
                download="cow-referral.svg"
                $disabled={!qrSvgUrl}
                onClick={(event) => {
                  if (!qrSvgUrl) event.preventDefault()
                }}
              >
                <Trans>Download .SVG</Trans>
              </DownloadLink>
              <DownloadLink
                href={qrPngUrl ?? '#'}
                download="cow-referral.png"
                $disabled={!qrPngUrl}
                onClick={(event) => {
                  if (!qrPngUrl) event.preventDefault()
                }}
              >
                <Trans>Download .PNG</Trans>
              </DownloadLink>
            </QrActions>
          </ModalBody>
        </ModalContent>
      </CowModal>
    </RewardsWrapper>
  )
}

function generateSuggestedCode(): string {
  const suffix = randomDigits(6)
  return `COW-${suffix}`
}

function randomDigits(length: number): string {
  return `${Math.floor(Math.random() * Math.pow(10, length))}`.padStart(length, '0')
}

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const LabelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`

const Label = styled.label`
  font-size: 14px;
  color: var(${UI.COLOR_TEXT});
`

const LabelContent = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
`

const LabelActions = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`

const MiniAction = styled.button`
  border: none;
  background: transparent;
  color: var(${UI.COLOR_PRIMARY});
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  text-transform: lowercase;

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`

const HelperText = styled.span`
  font-size: 13px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

const InlineError = styled.span`
  font-size: 12px;
  color: var(${UI.COLOR_DANGER_TEXT});
`

const PrimaryAction = styled(ButtonPrimary)`
  width: 100%;
`

const LinkedBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  flex: 1;
`

const LinkedCard = styled.div`
  border: 1px solid var(${UI.COLOR_INFO_BG});
  background: var(${UI.COLOR_PAPER});
  border-radius: 9px;
  overflow: hidden;
`

const LinkedCodeRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  background: var(${UI.COLOR_INFO_BG});
  color: var(${UI.COLOR_INFO_TEXT});
`

const LinkedCopy = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`

const LinkedCodeText = styled.span`
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  font-size: 18px;
  white-space: nowrap;
`

const LinkedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 14px;
`

const LinkedLinkRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px 12px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  border-top: 1px solid var(${UI.COLOR_BORDER});
`

const LinkedLinkText = styled.span`
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const LinkedActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
`

const LinkedFooter = styled.div`
  margin-top: auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`

const LinkedFooterNote = styled(MetaRow)`
  width: 100%;
  justify-content: center;
  text-align: center;
`

const LinkedActionButton = styled(ButtonSecondary)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  border-radius: 12px;
  border: 1px solid var(${UI.COLOR_BORDER});
  background: var(${UI.COLOR_PAPER});
  color: var(${UI.COLOR_TEXT});
  font-weight: 600;
  font-size: 14px;
  padding: 8px 14px;
  // min-height: 36px;
`

const LinkedActionIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: inherit;
`

const StatusText = styled.p<{ $variant: 'error' | 'success' }>`
  margin: 0;
  font-size: 14px;
  color: ${({ $variant }) => ($variant === 'error' ? `var(${UI.COLOR_DANGER_TEXT})` : `var(${UI.COLOR_SUCCESS_TEXT})`)};
`

const ModalContent = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const ModalTitle = styled.h4`
  margin: 0;
  font-size: 16px;
  color: var(${UI.COLOR_TEXT});
`

const ModalClose = styled.button`
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const QrUrl = styled.p`
  margin: 0;
  font-size: 12px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  word-break: break-all;
`

const QrFrame = styled.div`
  border-radius: 16px;
  background: var(${UI.COLOR_PAPER_DARKER});
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const QrImage = styled.img`
  width: ${QR_SIZE_PX}px;
  height: ${QR_SIZE_PX}px;
  border-radius: 12px;
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
  width: 16px;
  height: 16px;
  border-radius: 999px;
  border: 2px solid ${({ $active }) => ($active ? `var(${UI.COLOR_PRIMARY})` : 'transparent')};
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
  color: ${({ $disabled }) => ($disabled ? `var(${UI.COLOR_TEXT_OPACITY_50})` : `var(${UI.COLOR_TEXT})`)};
  pointer-events: ${({ $disabled }) => ($disabled ? 'none' : 'auto')};
`
