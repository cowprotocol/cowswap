import { ReactNode } from 'react'

import { PAGE_TITLES } from '@cowprotocol/common-const'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import { useLingui } from '@lingui/react/macro'

import { useAffiliatePartnerCode } from 'modules/affiliate/hooks/useAffiliatePartnerCode'
import { useAffiliatePartnerData } from 'modules/affiliate/hooks/useAffiliatePartnerData'
import { useAffiliatePartnerWallet } from 'modules/affiliate/hooks/useAffiliatePartnerWallet'
import { usePayoutHistory } from 'modules/affiliate/hooks/usePayoutHistory'
import { formatUsdcCompact } from 'modules/affiliate/lib/affiliateProgramUtils'
import { AffiliatePartnerCodeCard } from 'modules/affiliate/pure/AffiliatePartner/AffiliatePartnerCodeCard'
import { AffiliatePartnerOnboard } from 'modules/affiliate/pure/AffiliatePartner/AffiliatePartnerOnboard'
import { AffiliatePartnerQrModal } from 'modules/affiliate/pure/AffiliatePartner/AffiliatePartnerQrModal'
import { AffiliatePartnerTrafficCard } from 'modules/affiliate/pure/AffiliatePartner/AffiliatePartnerTrafficCard'
import { PayoutHistoryTable } from 'modules/affiliate/pure/PayoutHistoryTable'
import { AffiliateTermsFaqLinks, NextPayoutCard, ThreeColumnGrid, PageWrapper } from 'modules/affiliate/pure/shared'
import { PageTitle } from 'modules/application/containers/PageTitle'

export default function AffiliatePartner(): ReactNode {
  const { i18n } = useLingui()
  const provider = useWalletProvider()
  const wallet = useAffiliatePartnerWallet()
  const data = useAffiliatePartnerData({ account: wallet.account, isMainnet: wallet.isMainnet })
  const code = useAffiliatePartnerCode({
    account: wallet.account,
    chainId: wallet.chainId,
    isMainnet: wallet.isMainnet,
    existingCode: data.existingCode,
    setErrorMessage: data.setErrorMessage,
    createAffiliateCode: data.createAffiliateCode,
  })
  const { rows: payoutHistoryRows, loading: payoutHistoryLoading } = usePayoutHistory({
    account: wallet.account,
    role: 'affiliate',
  })

  const showOnboard =
    !wallet.isConnected || wallet.isUnsupported || (wallet.isConnected && !provider && !data.existingCode)
  const nextPayoutLabel = data.partnerStats ? formatUsdcCompact(data.partnerStats.next_payout) : formatUsdcCompact(0)

  return (
    <PageWrapper>
      <PageTitle title={i18n._(PAGE_TITLES.AFFILIATE)} />

      {showOnboard ? (
        <AffiliatePartnerOnboard
          isConnected={wallet.isConnected}
          isUnsupported={wallet.isUnsupported}
          shouldHideNetworkSelector={wallet.shouldHideNetworkSelector}
          isSignerAvailable={Boolean(provider)}
          walletName={wallet.walletName}
          onConnect={wallet.onConnect}
          onSwitchToMainnet={wallet.onSwitchToMainnet}
        />
      ) : (
        <>
          <ThreeColumnGrid>
            <AffiliatePartnerCodeCard
              showLinkedFlow={wallet.isConnected && wallet.isMainnet && !!data.existingCode}
              codeLoading={data.codeLoading}
              existingCode={data.existingCode}
              createdAt={data.createdAt}
              referralLink={code.referralLink}
              inputCode={code.inputCode}
              availability={code.availability}
              canSave={code.canSave}
              submitting={code.submitting}
              errorMessage={data.errorMessage}
              onGenerate={code.onGenerate}
              onInputChange={code.onInputChange}
              onCreate={code.onCreate}
              onOpenQr={code.onOpenQr}
              inputRef={code.inputRef}
            />
            <AffiliatePartnerTrafficCard
              loading={data.statsLoading || data.codeLoading}
              partnerStats={data.partnerStats}
              programParams={data.programParams}
            />
            <NextPayoutCard payoutLabel={nextPayoutLabel} showLoader={data.statsLoading || data.codeLoading} />
          </ThreeColumnGrid>
          <PayoutHistoryTable rows={payoutHistoryRows} showLoader={payoutHistoryLoading} />
          <AffiliateTermsFaqLinks align="center" />
        </>
      )}

      <AffiliatePartnerQrModal
        isOpen={code.isQrOpen}
        referralLink={code.referralLink}
        qrCodeRef={code.qrCodeRef}
        onDismiss={code.onDismissQr}
        onDownload={code.onDownloadQr}
      />
    </PageWrapper>
  )
}
