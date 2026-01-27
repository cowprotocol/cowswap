import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react'

import EARN_AS_AFFILIATE_ILLUSTRATION from '@cowprotocol/assets/images/earn-as-affiliate.svg'
import { PAGE_TITLES } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ButtonPrimary, ButtonSecondary, ButtonSize, HelpTooltip, Media, UI } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useLingui } from '@lingui/react/macro'
import { toDataURL, toString } from 'qrcode'
import styled from 'styled-components/macro'

import CopyHelper from 'legacy/components/Copy'
import { useToggleWalletModal } from 'legacy/state/application/hooks'

import { createAffiliateCode, getAffiliateCode, verifyReferralCode } from 'modules/affiliate/api/referralApi'
import { REFERRAL_HOW_IT_WORKS_URL } from 'modules/affiliate/config/constants'
import { buildAffiliateTypedData } from 'modules/affiliate/lib/typedData'
import { PageTitle } from 'modules/application/containers/PageTitle'

import { useModalState } from 'common/hooks/useModalState'
import { useOnSelectNetwork } from 'common/hooks/useOnSelectNetwork'
import { CowModal } from 'common/pure/Modal'
import { CardsLoader, CardsSpinner, Card, ExtLink } from 'pages/Account/styled'

const QR_SIZE_PX = 220

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
  const { isModalOpen: isQrOpen, openModal: openQrModal, closeModal: closeQrModal } = useModalState()
  const [qrColor, setQrColor] = useState<QrColor>('navy')
  const [qrPngUrl, setQrPngUrl] = useState<string | null>(null)
  const [qrSvgUrl, setQrSvgUrl] = useState<string | null>(null)
  const [qrError, setQrError] = useState<string | null>(null)

  const normalizedCode = useMemo(() => normalizeAffiliateCode(inputCode), [inputCode])
  const isCodeValid = useMemo(() => isAffiliateCodeValid(normalizedCode), [normalizedCode])
  const codeTooltip = t`UPPERCASE | 6-12 chars | A-Z 0-9 - _`

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
      return
    }

    setLoading(true)
    setErrorMessage(null)

    getAffiliateCode(account)
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
      verifyReferralCode({
        code: normalizedCode,
        account: account || '0x0000000000000000000000000000000000000000',
        chainId,
      })
        .then((response) => {
          if (!active) {
            return
          }

          if (response.code.status === 'invalid' && response.code.programActive) {
            setAvailability('available')
          } else {
            setAvailability('unavailable')
          }
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
      setErrorMessage(t`Enter a code with 6-12 characters (A-Z, 0-9, - or _).`)
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

      const response = await createAffiliateCode({
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
        setErrorMessage(t`Affiliate code disabled.`)
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
      setErrorMessage(t`Enter a code with 6-12 characters (A-Z, 0-9, - or _).`)
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
  const referralTarget = 50_000
  const referralVolume = 0
  const referralTrafficPercent = Math.min(100, Math.round((referralVolume / referralTarget) * 100))
  const claimableAmount = 0
  const hasClaimable = claimableAmount > 0

  const showHero = !isConnected || showUnsupported || (isConnected && !isSignerAvailable && !showLinkedFlow)

  const linkedSinceLabel = linkedAt ? formatDate(linkedAt) : '--'
  const rewardsEndLabel = linkedAt ? formatDate(addDays(linkedAt, 90)) : '--'

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
                <HeroLinks>
                  <ExtLink href="https://cow.fi/legal/cowswap-terms" target="_blank" rel="noopener noreferrer">
                    <Trans>Terms</Trans>
                  </ExtLink>
                  <Separator>•</Separator>
                  <ExtLink href={REFERRAL_HOW_IT_WORKS_URL} target="_blank" rel="noopener noreferrer">
                    <Trans>FAQ</Trans>
                  </ExtLink>
                </HeroLinks>
                {showUnsupported && (
                  <InlineNote>
                    <Trans>Affiliate payouts happen on Ethereum mainnet.</Trans>
                  </InlineNote>
                )}
              </HeroContent>
            </HeroCard>
          ) : (
            <>
              <RewardsGrid>
                <CardStack>
                  {showLinkedFlow && existingCode ? (
                    <LinkedBlock>
                      <LinkedHeader>
                        <LinkedTitle>
                          <Trans>Your referral code</Trans>
                        </LinkedTitle>
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
                        <Label>
                          <Trans>Create your referral code</Trans>
                        </Label>
                        <MiniAction onClick={handleGenerate} disabled={submitting}>
                          <Trans>generate</Trans>
                        </MiniAction>
                      </LabelRow>
                      <HelperText>
                        <Trans>
                          Type or generate a code (subject to availability). Saving locks this code to your wallet and
                          can't be changed.
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
                          <HelperText>
                            <Trans>Links/codes don't reveal your wallet.</Trans>
                          </HelperText>
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
                </CardStack>

                <CardStack>
                  <CardHeader>
                    <CardTitle>
                      <Trans>Your referral traffic</Trans>
                    </CardTitle>
                  </CardHeader>
                  <MetricsRow>
                    <Donut $value={referralTrafficPercent}>
                      <DonutValue>
                        <span>{`$${referralVolume.toLocaleString()}`}</span>
                        <small>
                          <Trans>of</Trans> ${referralTarget.toLocaleString()}
                        </small>
                      </DonutValue>
                    </Donut>
                    <MetricsList>
                      <MetricItem>
                        <span>
                          <Trans>Left to next $10</Trans>
                        </span>
                        <strong>-</strong>
                      </MetricItem>
                      <MetricItem>
                        <span>
                          <Trans>Total earned</Trans>
                        </span>
                        <strong>-</strong>
                      </MetricItem>
                      <MetricItem>
                        <span>
                          <Trans>Claimed</Trans>
                        </span>
                        <strong>-</strong>
                      </MetricItem>
                      <MetricItem>
                        <span>
                          <Trans>Volume referred</Trans>
                        </span>
                        <strong>-</strong>
                      </MetricItem>
                      <MetricItem>
                        <span>
                          <Trans>Active referrals</Trans>
                        </span>
                        <strong>-</strong>
                      </MetricItem>
                    </MetricsList>
                  </MetricsRow>
                  <MetaRow>
                    <Trans>Last updated: --</Trans>
                  </MetaRow>
                </CardStack>
                <CardStack>
                  <CardHeader>
                    <CardTitle>
                      <Trans>Claimable rewards</Trans>
                    </CardTitle>
                  </CardHeader>
                  <ClaimValue>{claimableAmount} USDC</ClaimValue>
                  <ButtonPrimary disabled={!hasClaimable}>
                    {hasClaimable ? t`Switch to base & claim` : t`No rewards to claim`}
                  </ButtonPrimary>
                </CardStack>
              </RewardsGrid>

              <FooterLinksCentered>
                <ExtLink href="https://cow.fi/legal/cowswap-terms" target="_blank" rel="noopener noreferrer">
                  <Trans>Terms</Trans>
                </ExtLink>
                <Separator>•</Separator>
                <ExtLink href={REFERRAL_HOW_IT_WORKS_URL} target="_blank" rel="noopener noreferrer">
                  <Trans>FAQ</Trans>
                </ExtLink>
              </FooterLinksCentered>
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
  return /^[A-Z0-9_-]{6,12}$/.test(code)
}

function generateSuggestedCode(): string {
  const suffix = randomDigits(4)
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

type BadgeTone = 'neutral' | 'info' | 'success' | 'error'

const RewardsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const RewardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;

  ${Media.upToMedium()} {
    grid-template-columns: 1fr;
  }
`

const HeroCard = styled(Card)`
  max-width: 520px;
  align-items: center;
  justify-content: center;
  text-align: center;
`

const HeroContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
`
const HeroTitle = styled.h1`
  margin: 0;
  color: var(${UI.COLOR_TEXT});
`

const HeroSubtitle = styled.p`
  margin: 0;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

const HeroActions = styled.div`
  display: flex;
  justify-content: center;
  min-width: 320px;
`

const HeroLinks = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

const Separator = styled.span`
  opacity: 0.6;
`

const InlineNote = styled.p`
  margin: 0;
  font-size: 12px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

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
  font-size: 12px;
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

const LinkedHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`

const LinkedTitle = styled.h4`
  margin: 0;
  font-size: 16px;
  color: var(${UI.COLOR_TEXT});
`

const CodeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`

const CodeBadge = styled.span`
  padding: 6px 12px;
  border-radius: 999px;
  background: var(${UI.COLOR_PAPER_DARKER});
  color: var(${UI.COLOR_TEXT});
  font-weight: 600;
  font-size: 14px;
`

const InfoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});

  > span:last-child {
    color: var(${UI.COLOR_TEXT});
  }
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

const InlineActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`

const StatusText = styled.p<{ $variant: 'error' | 'success' }>`
  margin: 0;
  font-size: 14px;
  color: ${({ $variant }) => ($variant === 'error' ? `var(${UI.COLOR_DANGER_TEXT})` : `var(${UI.COLOR_SUCCESS_TEXT})`)};
`

const FooterLinksCentered = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 12px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

const CardStack = styled(Card)`
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
`

const CardHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const CardTitle = styled.h4`
  margin: 0;
  font-size: 16px;
  color: var(${UI.COLOR_TEXT});
`

const MetricsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
`

const MetricsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const MetricItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 13px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});

  strong {
    color: var(${UI.COLOR_TEXT});
    font-size: 16px;
  }
`

const MetaRow = styled.p`
  margin: 0;
  font-size: 12px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

const ClaimValue = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: var(${UI.COLOR_TEXT});
`

const Badge = styled.span<{ $tone: BadgeTone }>`
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ $tone }) => {
    switch ($tone) {
      case 'success':
        return `var(${UI.COLOR_SUCCESS_BG})`
      case 'error':
        return `var(${UI.COLOR_DANGER_BG})`
      case 'info':
        return `var(${UI.COLOR_PRIMARY_OPACITY_10})`
      default:
        return `var(${UI.COLOR_PAPER_DARKER})`
    }
  }};
  color: ${({ $tone }) => {
    switch ($tone) {
      case 'success':
        return `var(${UI.COLOR_SUCCESS_TEXT})`
      case 'error':
        return `var(${UI.COLOR_DANGER_TEXT})`
      case 'info':
        return `var(${UI.COLOR_INFO})`
      default:
        return `var(${UI.COLOR_TEXT})`
    }
  }};
`

const Donut = styled.div<{ $value: number }>`
  --size: 90px;
  --thickness: 10px;
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  background: conic-gradient(var(${UI.COLOR_INFO}) ${({ $value }) => $value}%, var(${UI.COLOR_TEXT_OPACITY_10}) 0);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex: 0 0 auto;

  &::after {
    content: '';
    width: calc(var(--size) - var(--thickness) * 2);
    height: calc(var(--size) - var(--thickness) * 2);
    border-radius: 50%;
    background: var(${UI.COLOR_PAPER});
    position: absolute;
  }

  > div {
    position: relative;
    font-size: 12px;
    font-weight: 600;
    color: var(${UI.COLOR_TEXT});
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    text-align: center;

    small {
      font-size: 10px;
      color: var(${UI.COLOR_TEXT_OPACITY_70});
      font-weight: 500;
    }
  }
`

const DonutValue = styled.div``

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
