import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react'

import EARN_AS_AFFILIATE_ILLUSTRATION from '@cowprotocol/assets/images/earn-as-affiliate.svg'
import { PAGE_TITLES } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ButtonPrimary, ButtonSecondary, ButtonSize, HelpTooltip, UI } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useLingui } from '@lingui/react/macro'
import { toDataURL, toString } from 'qrcode'
import styled from 'styled-components/macro'

import CopyHelper from 'legacy/components/Copy'
import { useToggleWalletModal } from 'legacy/state/application/hooks'

import { bffAffiliateApi } from 'modules/affiliate/api'
import { buildAffiliateTypedData } from 'modules/affiliate/lib/affiliate-program-utils'
import { AffiliateStatsResponse } from 'modules/affiliate/model/types'
import {
  type BadgeTone,
  Badge,
  CardHeader,
  CardTitle,
  ClaimValue,
  CodeBadge,
  DonutValue,
  RewardsDonut,
  RewardsCol1Card,
  RewardsCol2Card,
  RewardsCol3Card,
  RewardsMetricItem,
  RewardsMetricsList,
  RewardsMetricsRow,
  RewardsThreeColumnGrid,
  HeroActions,
  HeroCard,
  HeroContent,
  HeroSubtitle,
  HeroTitle,
  InlineActions,
  InlineNote,
  InfoItem,
  InfoList,
  LinkedHeader,
  MetaRow,
  ReferralTermsFaqLinks,
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
  const [confirming, setConfirming] = useState(false)
  const [hasEdited, setHasEdited] = useState(false)
  const [linkedAt, setLinkedAt] = useState<Date | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [affiliateStats, setAffiliateStats] = useState<AffiliateStatsResponse | null>(null)
  const [statsUpdatedAt, setStatsUpdatedAt] = useState<Date | null>(null)
  const { isModalOpen: isQrOpen, openModal: openQrModal, closeModal: closeQrModal } = useModalState()
  const [qrColor, setQrColor] = useState<QrColor>('navy')
  const [qrPngUrl, setQrPngUrl] = useState<string | null>(null)
  const [qrSvgUrl, setQrSvgUrl] = useState<string | null>(null)
  const [qrError, setQrError] = useState<string | null>(null)

  const normalizedCode = useMemo(() => normalizeAffiliateCode(inputCode), [inputCode])
  const isCodeValid = useMemo(() => isAffiliateCodeValid(normalizedCode), [normalizedCode])
  const codeTooltip = t`UPPERCASE | 5-20 chars | A-Z 0-9 - _`
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

    const dateLabel = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'UTC',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(value)
    const timeLabel = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'UTC',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(value)

    return `${dateLabel} - ${timeLabel} GMT`
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

  const availabilityLabel = useMemo(() => {
    switch (availability) {
      case 'checking':
        return t`Checking availability...`
      case 'available':
        return t`Available`
      case 'unavailable':
        return t`Unavailable`
      case 'invalid':
        return t`Invalid format`
      case 'error':
        return t`Unable to check`
      default:
        return t`Availability`
    }
  }, [availability])

  const availabilityTone: BadgeTone = useMemo(() => {
    switch (availability) {
      case 'available':
        return 'success'
      case 'unavailable':
      case 'error':
      case 'invalid':
        return 'error'
      case 'checking':
        return 'info'
      default:
        return 'neutral'
    }
  }, [availability])

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
        } else {
          setExistingCode(null)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setExistingCode(null)
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
      return
    }

    bffAffiliateApi
      .getAffiliateStats(account)
      .then((stats) => {
        if (cancelled) {
          return
        }

        setAffiliateStats(stats)
        setStatsUpdatedAt(stats ? new Date() : null)
      })
      .catch(() => {
        if (!cancelled) {
          setAffiliateStats(null)
          setStatsUpdatedAt(null)
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

    if (availability === 'unavailable' || availability === 'error') {
      setErrorMessage(t`That code is unavailable. Try another.`)
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
      setLinkedAt(new Date())
      setSuccessMessage(t`Affiliate code created.`)
      setConfirming(false)
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

  const handleInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setHasEdited(true)
    setConfirming(false)
    setErrorMessage(null)
    setSuccessMessage(null)
    setInputCode(event.target.value.toUpperCase())
  }, [])

  const handleGenerate = useCallback(() => {
    setHasEdited(true)
    setConfirming(false)
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

  const handleStartConfirm = useCallback(() => {
    if (!isCodeValid) {
      setErrorMessage(t`Enter a code with 5-20 characters (A-Z, 0-9, - or _).`)
      return
    }

    if (availability === 'unavailable' || availability === 'error') {
      setErrorMessage(t`That code is unavailable. Try another.`)
      return
    }

    setConfirming(true)
  }, [availability, isCodeValid])

  const handleCancelConfirm = useCallback(() => {
    setConfirming(false)
  }, [])

  const canSave = showCreateForm && isCodeValid && availability === 'available' && !submitting
  const showCodeUnavailable = availability === 'unavailable'
  const showInvalidFormat = availability === 'invalid'
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

  const linkedSinceLabel = linkedAt ? formatDate(linkedAt) : '-'
  const rewardsEndLabel = linkedAt ? formatDate(addDays(linkedAt, 90)) : '-'
  const statsUpdatedLabel = formatUpdatedAt(statsUpdatedAt)

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
                      <LinkedHeader>
                        <CardTitle>
                          <Trans>Your referral code</Trans>
                        </CardTitle>
                        <Badge $tone="success">
                          <Trans>Linked</Trans>
                        </Badge>
                      </LinkedHeader>

                      <CodeRow>
                        <CodeBadge>{existingCode}</CodeBadge>
                        <CopyHelper toCopy={existingCode} iconSize={16} iconPosition="right">
                          <Trans>Copy code</Trans>
                        </CopyHelper>
                      </CodeRow>

                      <InfoList>
                        <InfoItem>
                          <span>
                            <Trans>Referral link</Trans>
                          </span>
                          <CopyHelper toCopy={referralLink} iconSize={16} iconPosition="right">
                            <Trans>Copy link</Trans>
                          </CopyHelper>
                        </InfoItem>
                        <InfoItem>
                          <span>
                            <Trans>Linked since</Trans>
                          </span>
                          <span>{linkedSinceLabel}</span>
                        </InfoItem>
                        <InfoItem>
                          <span>
                            <Trans>Rewards end</Trans>
                          </span>
                          <span>{rewardsEndLabel}</span>
                        </InfoItem>
                      </InfoList>

                      <InlineActions>
                        <ButtonSecondary
                          as="a"
                          href={`https://twitter.com/intent/tweet?text=${shareText}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Trans>Share on X</Trans>
                        </ButtonSecondary>
                        <ButtonSecondary onClick={handleOpenQr}>
                          <Trans>Download QR code</Trans>
                        </ButtonSecondary>
                      </InlineActions>
                    </LinkedBlock>
                  ) : (
                    <Form>
                      <LabelRow>
                        <CardTitle>
                          <Trans>Create your referral code</Trans>
                        </CardTitle>
                        <MiniAction onClick={handleGenerate} disabled={submitting}>
                          <Trans>generate</Trans>
                        </MiniAction>
                      </LabelRow>
                      <HelperText>
                        <Trans>
                          Type or generate a code (subject to availability). Saving locks this code to your wallet and
                          can't be changed. Links/codes don't reveal your wallet.
                        </Trans>
                      </HelperText>
                      {!confirming ? (
                        <>
                          <LabelRow>
                            <Label htmlFor="affiliate-code">
                              <LabelContent>
                                <Trans>Referral code</Trans>
                                <HelpTooltip text={codeTooltip} />
                              </LabelContent>
                            </Label>
                            <Badge $tone={availabilityTone}>{availabilityLabel}</Badge>
                          </LabelRow>
                          <Input
                            id="affiliate-code"
                            value={inputCode}
                            placeholder={t`Enter your code`}
                            onChange={handleInputChange}
                            disabled={submitting}
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
                          <PrimaryAction
                            onClick={handleStartConfirm}
                            disabled={!canSave}
                            data-testid="affiliate-start-confirm"
                          >
                            {submitting ? t`Signing...` : t`Save & lock code`}
                          </PrimaryAction>
                        </>
                      ) : (
                        <>
                          <ConfirmBlock>
                            <ConfirmTitle>
                              <Trans>Lock this code to your wallet?</Trans>
                            </ConfirmTitle>
                            <ConfirmText>
                              <Trans>This action is permanent. You won't be able to change it.</Trans>
                            </ConfirmText>
                            <CodeBadge>{normalizedCode}</CodeBadge>
                          </ConfirmBlock>
                          <InlineActions>
                            <ButtonSecondary onClick={handleCancelConfirm} disabled={submitting}>
                              <Trans>Edit</Trans>
                            </ButtonSecondary>
                            <ButtonPrimary onClick={handleCreate} disabled={!canSave} data-testid="affiliate-confirm">
                              {submitting ? t`Signing...` : t`Confirm`}
                            </ButtonPrimary>
                          </InlineActions>
                        </>
                      )}
                    </Form>
                  )}
                </RewardsCol1Card>

                <RewardsCol2Card>
                  <CardHeader>
                    <CardTitle>
                      <Trans>Your referral traffic</Trans>
                    </CardTitle>
                  </CardHeader>
                  <RewardsMetricsRow>
                    <RewardsMetricsList>
                      <RewardsMetricItem>
                        <span>
                          <Trans>Left to next $10</Trans>
                        </span>
                        <strong>{leftToNextRewardLabel}</strong>
                      </RewardsMetricItem>
                      <RewardsMetricItem>
                        <span>
                          <Trans>Total earned</Trans>
                        </span>
                        <strong>{totalEarnedLabel}</strong>
                      </RewardsMetricItem>
                      <RewardsMetricItem>
                        <span>
                          <Trans>Claimed</Trans>
                        </span>
                        <strong>{paidOutLabel}</strong>
                      </RewardsMetricItem>
                      <RewardsMetricItem>
                        <span>
                          <Trans>Volume referred</Trans>
                        </span>
                        <strong>{totalVolumeLabel}</strong>
                      </RewardsMetricItem>
                      <RewardsMetricItem>
                        <span>
                          <Trans>Active referrals</Trans>
                        </span>
                        <strong>{activeReferralsLabel}</strong>
                      </RewardsMetricItem>
                    </RewardsMetricsList>

                    <RewardsDonut $value={referralTrafficPercent}>
                      <DonutValue>
                        <span>{progressToNextRewardLabel}</span>
                        <small>
                          <Trans>of</Trans> {referralTargetLabel}
                        </small>
                      </DonutValue>
                    </RewardsDonut>
                  </RewardsMetricsRow>
                  <MetaRow>
                    <Trans>Last updated: {statsUpdatedLabel}</Trans>
                  </MetaRow>
                </RewardsCol2Card>
                <RewardsCol3Card>
                  <CardHeader>
                    <CardTitle>
                      <Trans>Next payout</Trans>
                    </CardTitle>
                  </CardHeader>
                  <ClaimValue>{nextPayoutLabel}</ClaimValue>
                </RewardsCol3Card>
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

function normalizeAffiliateCode(code: string): string {
  return code.trim().toUpperCase()
}

function isAffiliateCodeValid(code: string): boolean {
  return /^[A-Z0-9_-]{5,20}$/.test(code)
}

function generateSuggestedCode(): string {
  const suffix = randomDigits(6)
  return `COW-${suffix}`
}

function randomDigits(length: number): string {
  return `${Math.floor(Math.random() * Math.pow(10, length))}`.padStart(length, '0')
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })
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

const Input = styled.input`
  height: 48px;
  border-radius: 12px;
  padding: 0 16px;
  border: 1px solid var(${UI.COLOR_BORDER});
  background: var(${UI.COLOR_PAPER_DARKER});
  color: var(${UI.COLOR_TEXT});
  font-size: 16px;

  &:disabled {
    opacity: 0.6;
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
  gap: 12px;
`

const CodeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`

const ConfirmBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const ConfirmTitle = styled.h4`
  margin: 0;
  font-size: 16px;
  color: var(${UI.COLOR_TEXT});
`

const ConfirmText = styled.p`
  margin: 0;
  font-size: 14px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
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
