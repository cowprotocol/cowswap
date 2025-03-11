'use client'

import { Color } from '@cowprotocol/ui'
import { useCowAnalytics } from '@cowprotocol/analytics'
import { CowFiCategory } from 'src/common/analytics/types'

import styled from 'styled-components/macro'
import { Link } from '@/components/Link'

import { ArticleContent, ArticleMainTitle, BodyContent, Breadcrumbs, ContainerCard } from '@/styles/styled'

const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  justify-content: flex-start;
  align-items: center;
  max-width: 1000px;
  width: 100%;
  margin: 24px auto 0;
  gap: 24px;
`

export default function Page() {
  const analytics = useCowAnalytics()
  const title = 'CoW Swap Terms and Conditions'

  return (
    <Wrapper>
      <ContainerCard bgColor={Color.neutral100} minHeight="70vh" gap={62} gapMobile={42} centerContent touchFooter>
        <ArticleContent maxWidth="100%">
          <Breadcrumbs>
            <Link
              href="/"
              onClick={() =>
                analytics.sendEvent({
                  category: CowFiCategory.LEGAL,
                  action: 'click-legal-breadcrumbs',
                })
              }
            >
              Home
            </Link>
            <Link
              href="/legal"
              onClick={() =>
                analytics.sendEvent({
                  category: CowFiCategory.LEGAL,
                  action: 'click-legal-breadcrumbs',
                })
              }
            >
              Legal
            </Link>
            <span>{title}</span>
          </Breadcrumbs>

          <ArticleMainTitle margin={'0 0 62px'} fontSize={52}>
            {title}
          </ArticleMainTitle>
          <BodyContent>
            <p>
              <strong>Last updated: February 2025</strong>
            </p>
            <p>
              These Terms of Use (the &quot;Terms&quot;) govern your access to{' '}
              <a href="https://cow.fi/" target="_blank" rel="nofollow noopener">
                https://cow.fi/
              </a>{' '}
              (the &quot;Website&quot;) and use of any products offered or provided through the Website (collectively,
              the &quot;Products&quot;). The Website and Products are provided to you by CoW DAO (&quot;we&quot;,
              &quot;our&quot;, or &quot;us&quot;).
            </p>
            <p>
              CoW DAO is a collective managed by community members across various Ethereum Virtual Machine (EVM)
              compatible blockchains. These blockchains may include, but are not limited to, well-established networks
              such as Ethereum and Gnosis Chain and emerging solutions within Ethereum layer 2 solutions. The management
              of CoW DAO is in accordance with its participation agreement. For any inquiries or to establish contact
              with CoW DAO, please use the forum at{' '}
              <a href="https://forum.cow.fi/" target="_blank" rel="nofollow noopener">
                https://forum.cow.fi/
              </a>
              .
            </p>
            <p>The Products covered by these terms include but are not limited to:</p>
            <ul>
              <li>
                <p>The Interface; and</p>
              </li>
              <li>
                <p>The Forum</p>
              </li>
            </ul>
            <h2 id="important-prior-warnings">Important prior warnings</h2>
            <h3 id="financial-risks">Financial risks</h3>
            <p>
              Interacting with the Interface such as submitting orders to exchange compatible tokens involves
              significant risks of loss. You could lose all or more of your capital.
            </p>
            <p>
              The tokens' value is highly volatile causing price fluctuations, as auctions typically run for some time
              and trades are not executed instantly.
            </p>
            <p>
              Please carefully consider your investment objectives, risk tolerance, and experience before engaging in
              any trading activities. This is not financial advice, and you should always consult with a qualified
              financial professional before making any investment decisions.
            </p>
            <h3 id="beware-of-scammers">Beware of scammers</h3>
            <p>
              We will never contact you first, never ask you for a password, private keys, seed phrase, nor ask you to
              connect your wallet to a third-party decentralized application.
            </p>
            <h3 id="technical-understanding">Technical understanding</h3>
            <p>
              Cryptographic assets are described in technical language requiring a comprehensive understanding of
              computer science and mathematics to appreciate the inherent risks.
            </p>
            <h3 id="transactions-on-public-blockchains-are-publicly-accessible">
              Transactions on public blockchains are publicly accessible
            </h3>
            <p>
              Please be aware that all transactions on public blockchains are permanently recorded and publicly
              accessible. This means anyone can view the details of your transactions, including the amount, sender, and
              receiver addresses. While this transparency offers benefits like security and trust, it also means your
              privacy is not guaranteed. If you require anonymity or confidentiality for your transactions, please
              consider using a different platform.
            </p>
            <h3 id="transactions-on-public-blockchains-are-immutable-and-irreversible">
              Transactions on public blockchains are immutable and irreversible
            </h3>
            <p>
              Transactions on public blockchains are generally immutable and irreversible. Any transaction thereon is
              therefore irrevocable and final as soon as it is settled thereon. In the event that you send your tokens
              to sell to any other destination other than the Protocol smart contracts, such tokens may not be returned.
              We assume no responsibility and shall have no obligation to you if this occurs, including but not limited
              to any responsibility to recover, or assist to recover, any such tokens.
            </p>
            <h2 id="please-read-these-terms-carefully-before-using-the-website-or-the-products-">
              Please read these Terms carefully before using the Website or the Products.
            </h2>
            <h3 id="acceptance-of-these-terms">Acceptance of these Terms</h3>
            <p>
              By accessing the Website and/or by using our Products, you confirm that you accept these Terms and agree
              to comply with them. If you do not agree, you must not use the Products and leave the Website. If you
              think that there is an error in these Terms, please contact us at{' '}
              <a href="mailto:legal@cow.fi" target="_blank" rel="nofollow noopener">
                legal@cow.fi
              </a>
              .
            </p>
            <p>
              You are also responsible for ensuring that all persons who access the Website or the Products through your
              internet connection or device are aware of these Terms and that they comply with them.
            </p>
            <p>
              We may terminate or suspend your access to the Website or the Products immediately, without prior notice
              or liability, if you breach any clause of the Terms. Upon termination of your access, your right to access
              the website or use the Products will immediately cease.
            </p>
            <h3 id="change-of-these-terms">Change of these Terms</h3>
            <p>
              We may amend these Terms at our sole discretion. We regularly do so. Every time you wish to access the
              Website or use the Products, please check these Terms to ensure you understand the terms that apply at
              that time.
            </p>
            <h2 id="cow-protocol">CoW Protocol</h2>
            <p>
              CoW Protocol (the &quot;Protocol&quot;) is a decentralized protocol owned and operated by CoW DAO that
              allows users to trade certain digital assets.
            </p>
            <p>
              CoW Protocol is a set of smart contracts that applies batch auction mechanisms to allow peer-to-peer
              trades on well-established networks such as Ethereum and Gnosis Chain and emerging solutions within
              Ethereum layer 2 solutions. CoW DAO is not custodian or counterparty to any transactions executed by you
              on the Protocol. We do not support any other service, particularly we do not provide any order matching,
              guaranteed prices, or similar exchange or trading platform services.
            </p>
            <p>
              Please consult our{' '}
              <a href="https://docs.cow.fi/cow-protocol" target="_blank" rel="nofollow noopener">
                documentation
              </a>{' '}
              for more information on CoW Protocol.
            </p>
            <h2 id="the-interface">The Interface</h2>
            <p>
              <a href="https://swap.cow.fi/" target="_blank" rel="nofollow noopener">
                https://swap.cow.fi
              </a>{' '}
              is a web-hosted user interface (the &quot;Interface&quot;) providing access to CoW Protocol. You may
              submit orders into the Interface and exchange compatible tokens using the unique features of the Protocol.
            </p>
            <p>
              Please consult our{' '}
              <a href="https://docs.cow.fi/cow-protocol/tutorials/cow-swap" target="_blank" rel="nofollow noopener">
                documentation
              </a>{' '}
              for more information on our Interface.
            </p>
            <p>
              The features of the Interface can also be accessed through third parties' websites integrating our widget
              (the &quot;Widget&quot;).
            </p>
            <p>
              Please consult our{' '}
              <a href="https://docs.cow.fi/cow-protocol/tutorials/widget" target="_blank" rel="nofollow noopener">
                documentation
              </a>{' '}
              for more information on our Widget.
            </p>
            <h3 id="restricted-use-of-the-interface">Restricted use of the Interface</h3>
            <p>
              To use the Interface, you must be legally capable of entering into a contract. Therefore, you confirm that
              you are of legal age in your jurisdiction and have the full rights, powers, and authority to enter into
              and abide by these Terms on your own behalf and on behalf of any company, legal entity or any other
              undertaking for which you may access or use the Interface.
            </p>
            <p>
              <b>
                Furthermore, you confirm that you are not (a) subject to economic or trade sanctions imposed by any
                government agency or listed on any prohibited or restricted party list or (b) a citizen, resident, or
                organisation located in a jurisdiction subject to comprehensive economic sanctions by, without being
                limited to the United Nations, the European Union and its Member States, the United States and the
                United Kingdom.
              </b>
            </p>
            <p>
              Finally, you confirm that your use of the Interface will fully comply with all applicable laws and
              regulations, and you will not use the Interface to conduct, promote, or facilitate any illegal activities.
            </p>
            <h3 id="use-of-the-interface">Use of the Interface</h3>
            <p>
              By using the Interface, you understand that you are not buying or selling digital assets from CoW DAO.
            </p>
            <p>
              You are responsible for ensuring that all persons who access or use the Interface through your device or
              internet connection are aware of these Terms, and that they comply with them.
            </p>
            <p>
              You may have been recommended to the Interface by a third party. We shall not be liable for any agreement
              or terms that may exist between you and the respective third party.
            </p>
            <h3 id="requirements-to-use-the-interface">Requirements to Use the Interface</h3>
            <p>
              To use the Interface, you must employ a non-custodial wallet application, enabling interaction with EVM
              compatible public blockchains. Your connection with the non-custodial wallet provider is governed by the
              applicable service terms of such a third-party wallet provider. We do not hold custody of your wallet's
              contents and are unable to recover or transfer such content. By connecting your wallet to our Interface,
              you agree to be bound by these Terms and all of the terms incorporated herein by reference.
            </p>
            <p>
              For more details on how to use the Interface please refer to our{' '}
              <a href="https://cow.fi/learn" target="_blank" rel="nofollow noopener">
                &quot;Knowledge Base&quot;
              </a>
              .
            </p>
            <h3 id="fees">Fees</h3>
            <h4 id="protocol-fee">Protocol fee</h4>
            <p>
              The user may incur a fee at protocol level, which - if technically possible - is shown to the user on the
              Interface when the user places their trade intent. Such a fee is designed in accordance with the specific
              features of the protocol.
            </p>
            <h4 id="widget-integrator-s-fee">Widget Integrator's Fee</h4>
            <p>
              Third-party integrators can embed the Interface on their own website using the Widget may charge an
              additional service fee to the user of the Widget on their website. The user acknowledges that such a
              service fee is not charged by us but exclusively by the third-party integrator.
            </p>
            <p>
              The user of the Widget understands and agrees that we are not responsible for such a fee and that it is
              the sole responsibility of the user of the Widget to carefully review the terms and conditions provided by
              the third-party integrator before using Widget.
            </p>
            <h3 id="interface-changes-updates-and-withdrawal">Interface Changes, Updates and Withdrawal</h3>
            <p>
              We may update and change the Interface from time to time. We do not guarantee that the Interface will
              always be available or be uninterrupted or be free of charge.
            </p>
            <p>
              We reserve the right to suspend or withdraw or restrict the availability of all or any part of the
              Interface for whatever reasons.
            </p>
            <h3 id="non-custody-and-wallet-security">Non-Custody and Wallet Security</h3>
            <p>
              The Interface operates as a non-custodial application, which implies that we, at no point in time, assume
              custody, ownership, or control over your digital assets.
            </p>
            <p>
              This further underscores your unequivocal responsibility for safeguarding the cryptographic private keys
              associated with your digital asset wallets. Under no circumstances should you disclose your wallet
              credentials or seed phrase to any third party. We disclaim any responsibility or liability whatsoever in
              connection with your utilization of a wallet, and we make no representations or warranties regarding the
              compatibility of the Interface with any particular wallet. Likewise, accountability for any associated
              wallet rests solely with you, and we shall not be held responsible for any actions or omissions undertaken
              by you in relation to or as a consequence of your wallet being compromised.
            </p>
            <h3 id="no-fiduciary-duty">No Fiduciary Duty</h3>
            <p>
              To the fullest extent permitted by law, you acknowledge and agree that we owe no fiduciary duties or
              liabilities to you or any other party, and that to the extent any such duties or liabilities may exist at
              law or in equity, those duties and liabilities are hereby irrevocably disclaimed, waived, and eliminated.
              You further agree that the only duties and obligations that we owe you are those set out expressly in
              these Terms.
            </p>
            <h3 id="tax-responsibility">Tax Responsibility</h3>
            <p>
              You are solely responsible to determine if your use of the Interface has tax implications for you. By
              using the Interface you agree not to hold us liable for any tax liability you incur arising out of or
              associated with your usage of the Interface or any other action or transaction related thereto.
            </p>
            <h2 id="the-forum">The Forum</h2>
            <h3 id="access-to-and-use-of-https-forum-cow-fi-">
              Access to and Use of{' '}
              <a href="https://forum.cow.fi" target="_blank" rel="nofollow noopener">
                https://forum.cow.fi
              </a>
            </h3>
            <p>
              https://forum.cow.fi (the &quot;Forum&quot;) is a moderated online forum for discussing CoW Protocol and
              partially exercising COW Protocol's governance process.
            </p>
            <p>You may access and use the Forum only for lawful purposes and in compliance with these Terms of Use.</p>
            <h3 id="registration-and-account-security">Registration and Account Security</h3>
            <p>
              In order to use the Forum Name, you may be required to register for an account. You must provide accurate
              and complete information when registering and you are responsible for keeping your account information
              up-to-date and secure. You agree not to share your account information with anyone else.
            </p>
            <h3 id="acceptable-use">Acceptable Use</h3>
            <p>
              You agree not to post any content that is unlawful, harmful, threatening, abusive, harassing, defamatory,
              vulgar, obscene, invasive of another's privacy, or otherwise promoting illegal or harmful activities.
            </p>
            <p>
              You will not impersonate any person or entity or falsely state or otherwise misrepresent your affiliation
              with a person or entity.
            </p>
            <p>
              You will not post advertisements or solicitations of business without explicit permission from the forum
              administrators.
            </p>
            <p>
              You agree to respect the copyright and intellectual property rights of others. You may not post any
              content that infringes on the copyright or other intellectual property rights of others.
            </p>
            <h3 id="user-conduct">User Conduct</h3>
            <p>You agree to be respectful of other users of the Forum. You agree not to:</p>
            <ul>
              <li>
                <p>Harass or bully other users;</p>
              </li>
              <li>
                <p>Engage in personal attacks or insults;</p>
              </li>
              <li>
                <p>Spam or post irrelevant content;</p>
              </li>
              <li>
                <p>Create multiple accounts for the purpose of disrupting or manipulating the forum;</p>
              </li>
              <li>
                <p>Violate the privacy of other users.</p>
              </li>
            </ul>
            <h3 id="content-ownership-and-responsibility">Content Ownership and Responsibility</h3>
            <p>
              You retain all ownership rights to the content you post on the forum. However, by posting content, you
              grant the forum a non-exclusive, royalty-free license to use, reproduce, and distribute your content.
            </p>
            <p>
              You acknowledge and agree that all content posted on the forum is the sole responsibility of the
              individual who posted the content.
            </p>
            <h3 id="moderation-and-removal-of-content">Moderation and Removal of Content</h3>
            <p>
              The forum administrators reserve the right to monitor all user activity on the Forum. We may remove any
              content that violates these Terms of Use or that we deem to be inappropriate. We may also suspend or
              terminate your account if you violate these Terms of Use.
            </p>
            <h2 id="information-on-the-website-or-products-are-not-advice">
              Information on the Website or Products are not advice
            </h2>
            <p>
              None of the information available on the Website including the Interface and the Forum, or made otherwise
              available to you in relation to its use, constitutes any legal, tax, financial or other advice. When in
              doubt as to the action you should take, you should consult your legal, financial, tax or other
              professional advisors.
            </p>
            <h2 id="intellectual-property-rights">Intellectual Property Rights</h2>
            <p>
              Subject to the application of any miscellaneous open source license attaching to the software code of the
              Protocol and to the software code of the Products, we are the owner of all contents, including but not
              limited to software, text, images, trademarks, service marks, copyrights, patents, and designs. This means
              we own all the legal rights to them. You are not allowed to copy, modify, adapt, rent, license, sell,
              publish, distribute, or share access to the Interface or its contents with anyone else, unless we
              explicitly give you permission in writing. Simply using the Interface doesn't give you any ownership
              rights to it or its contents.
            </p>
            <p>
              Subject to your compliance with these Terms, we grant you a limited, revocable, non-exclusive,
              non-transferable, non-sublicensable licence to access the Protocol and the Products. This licence does not
              include any resale, commercial or derivative use of the Protocol or the Products. We reserve and retain
              all rights not expressly granted to you in these Terms. The Interface may not be reproduced, sold, or
              otherwise exploited for any commercial purpose without our express prior written consent. You may not
              frame or utilize framing techniques to enclose any trademark, logo, or other proprietary information of us
              without our express prior written consent. You may not misuse the Interface and may only use it as
              permitted by law. If you breach our intellectual property rights in violation of these Terms, your licence
              to use the Interface will automatically be revoked and terminated immediately.
            </p>
            <h2 id="bug-and-default">Bug and Default</h2>
            <p className={'warn'}>
              <strong>No Warranties</strong>: THE PRODUCTS ARE PROVIDED &quot;AS IS&quot; AND WITHOUT ANY WARRANTY OF
              ANY KIND, EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS,
              IMPLIED, OR STATUTORY, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS
              FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
            </p>
            <p className={'warn'}>
              <strong>Specific Disclaimers</strong>: WITHOUT LIMITING THE FOREGOING, COW DAO DOES NOT WARRANT THAT THE
              SOFTWARE:
            </p>
            <ul>
              <li>
                <p>Will meet your specific requirements or expectations;</p>
              </li>
              <li>
                <p>Will be uninterrupted, error-free, or completely secure;</p>
              </li>
              <li>
                <p>Will be compatible with all systems or devices;</p>
              </li>
              <li>
                <p>Will be accurate, complete, reliable, current, or virus-free.</p>
              </li>
            </ul>
            <h2 id="user-responsibilities-and-prohibited-actions">User Responsibilities and Prohibited Actions</h2>
            <h3 id="user-responsibilities">User Responsibilities</h3>
            <p>
              You are responsible for configuring your information technology and computer programs to access the
              Products Interface in a secure manner. This includes the use of appropriate virus protection software.
            </p>
            <p>You agree to use the Products only for their intended purpose and in accordance with these Terms.</p>
            <h3 id="prohibited-actions-">Prohibited Actions:</h3>
            <p>You are prohibited from misusing the Products by knowingly introducing any material that is:</p>
            <ul>
              <li>
                <p>Malicious, including viruses, worms, Trojan horses, and other harmful software;</p>
              </li>
              <li>
                <p>
                  Technologically harmful, including attempts to disrupt or damage the Interface or its infrastructure.
                </p>
              </li>
            </ul>
            <p>You are prohibited from attempting to gain unauthorized access to the:</p>
            <ul>
              <li>
                <p>Products;</p>
              </li>
              <li>
                <p>Server(s) hosting the Products;</p>
              </li>
              <li>
                <p>Any computer or database connected to the Products.</p>
              </li>
            </ul>
            <p>You are prohibited from attacking the Products through:</p>
            <ul>
              <li>
                <p>Denial-of-service attacks;</p>
              </li>
              <li>
                <p>Distributed denial-of-service attacks.</p>
              </li>
            </ul>
            <p>You acknowledge that any breach of this clause may constitute a criminal offense.</p>
            <h2 id="consequences-of-breaching-of-these-terms">Consequences of Breaching of these Terms</h2>
            <p>
              We reserve the right to immediately terminate your access to the Website or the Products upon any breach
              of these Terms.
            </p>
            <p>
              If you breach our intellectual property rights in violation of these Terms, your licence to use the
              Interface will automatically be revoked and terminated immediately.
            </p>
            <p>
              We may report any breach of this clause to the relevant law enforcement authorities and cooperate with
              them, including disclosing your identity where possible.
            </p>
            <p>
              Upon termination of your access, your right to use the Website or the Products will immediately cease.
              Clauses 7 to 22 and any other term intended so will survive any termination of these Terms.
            </p>
            <h2 id="indemnification-and-liability">Indemnification and Liability</h2>
            <p>
              You agree to release and indemnify, defend and hold us and any of our affiliates harmless, as well as any
              members, participants, directors, officers, employees, contractors, shareholders and representatives of
              any of the foregoing, from and against any and all losses, liabilities, damages, costs claims or actions
              of any kind arising or resulting from your use of the Interface, your breach of these Terms, and any of
              your acts or omissions that infringe the rights of any person.
            </p>
            <p>
              We reserve the right, at our own expense, to assume exclusive defence and control of any matter otherwise
              subject to indemnification by you and, in such case, you agree to cooperate with us in the defence of such
              matter.
            </p>
            <p>
              The indemnity set out here is in addition to, and not in lieu of, any other remedies that may be available
              to us under applicable law.
            </p>
            <h2 id="warranties">Warranties</h2>
            <p>By using our Products you hereby agree, represent and warrant that:</p>
            <ul>
              <li>You have read and understood the Terms and agree to be bound by them;</li>
              <li>
                You do not rely on, and shall have no remedies in respect of, any statement, representation, assurance
                or warranty (whether made innocently or negligently) that is not set out in these Terms;
              </li>
              <li>
                You have reached the legal age of majority applicable to you and you agree to provide legitimate and
                lawful documentation proving such status if we so request;
              </li>
              <li>
                Your usage of the Interface is legal under the laws of your jurisdiction or under the laws of any other
                jurisdiction to which you may be subject;
              </li>
              <li>You are not a person subject to sanction set out by the EU or Portugal;</li>
              <li>
                You understand the functionality, usage, storage, transmission mechanisms and intricacies associated
                with cryptographic assets, token storage facilities (including wallets), blockchain technology and
                blockchain-based software systems;
              </li>
              <li>
                You understand that transactions on the Ethereum Mainnet, Gnosis Chain and compatible layer 2 solutions
                are irreversible and may not be erased and that your wallet address and any transaction is displayed
                permanently and publicly and that you relinquish any right of rectification or erasure of personal data;
              </li>
              <li>
                You shall comply with any applicable tax obligations in your jurisdiction arising from your use of the
                interface;
              </li>
              <li>
                You shall not misuse or gain unauthorised access to the Interface by knowingly introducing viruses,
                Trojan horses, worms, time-bombs, keystroke loggers, spyware, adware or any other harmful programs or
                similar computer code designed to adversely affect the Interface and that in the event you do so or
                otherwise attack the Interface, we report any such activity to the relevant law enforcement authorities;
              </li>
              <li>
                You shall not access without authority, interfere with, damage or disrupt any part of the Interface, any
                equipment or network on which the Interface is stored, any software used in the provision of the
                Interface or any equipment or network or software owned or used by any third party;
              </li>
              <li>
                You shall not use the Interface for activities that are unlawful or fraudulent or have such purpose or
                effect or otherwise support any activities that breach applicable local, national or international law
                or regulations;
              </li>
              <li>
                You shall not use the Interface to trade cryptographic assets that are proceeds of criminal or
                fraudulent activity;
              </li>
              <li>
                The Interface, the Protocol, the Ethereum Blockchain, Gnosis Chain and compatible layer 2 solutions are
                in an early development stage and we accordingly do not guarantee an error-free process and give no
                price or liquidity guarantee;
              </li>
              <li>You are using the Interface at your own risk;</li>
              <li>
                The risks of using the Interface are substantial and include, but are not limited to, the ones set out
                in these Terms, which is hereby expressly incorporated into these Terms, and you are willing to accept
                the risk of loss associated therewith.
              </li>
            </ul>
            <h2 id="limitation-of-liability">Limitation of Liability</h2>
            <p>
              We do not exclude or limit our liability to you where it would be unlawful to do so. This includes
              liability for death or personal injury caused by our negligence or fraud.
            </p>
            <p className={'warn'}>
              YOU USE THIS INTERFACE AT YOUR OWN RISK AND YOU ASSUME FULL RESPONSIBILITY FOR SUCH USE. TO THE MAXIMUM
              EXTENT PERMITTED BY APPLICABLE LAW, WE EXCLUDE ALL IMPLIED CONDITIONS, WARRANTIES, REPRESENTATIONS OR
              OTHER TERMS THAT MAY APPLY TO THE INTERFACE. WE WILL NOT BE LIABLE TO YOU FOR ANY LOSS OR DAMAGE, WHETHER
              IN CONTRACT, TORT (INCLUDING NEGLIGENCE), BREACH OF STATUTORY DUTY, OR OTHERWISE, EVEN IF FORESEEABLE,
              ARISING UNDER OR IN CONNECTION WITH THE USE OF, OR INABILITY TO USE, THE INTERFACE; OR THE USE OF OR
              RELIANCE ON ANY CONTENT DISPLAYED ON THE INTERFACE. WE WILL NOT BE LIABLE FOR LOSS OF PROFITS, SALES,
              BUSINESS, OR REVENUE, BUSINESS INTERRUPTION, ANTICIPATED SAVINGS, BUSINESS OPPORTUNITY, GOODWILL OR
              REPUTATION OR ANY INDIRECT OR CONSEQUENTIAL LOSS OR DAMAGE.
            </p>
            <p>
              We are not liable for any funds lost due to your interaction with scam websites or activities imitating
              the Interface.
            </p>
            <p>
              You are responsible for ensuring you are interacting with the correct URL and taking necessary precautions
              to avoid scams or fraudulent activities impersonating us.
            </p>
            <h2 id="we-are-not-registered-with-any-governmental-agency">
              We Are Not Registered with any Governmental Agency
            </h2>
            <p>
              We are not registered with any governmental supervisory authority in any capacity. You understand and
              acknowledge that we do not broker trading orders on your behalf. We also do not facilitate the execution
              or settlement of your trades, which occur entirely on public distributed blockchains.
            </p>
            <h2 id="no-fiduciary-duty">No Fiduciary Duty</h2>
            <p>
              To the fullest extent permitted by law, you acknowledge and agree that we owe no fiduciary duties or
              liabilities to you or any other party, and that to the extent any such duties or liabilities may exist at
              law or in equity, those duties and liabilities are hereby irrevocably disclaimed, waived, and eliminated.
              You further agree that the only duties and obligations that we owe you are those set out expressly in this
              Agreement.
            </p>
            <h2 id="dispute-resolution">Dispute Resolution</h2>
            <h3 id="amicable-dispute-resolution">Amicable Dispute Resolution</h3>
            <p>
              If an alleged breach, controversy, claim, dispute or difference arises out of or in connection with the
              present Terms about or in connection to this Interface between you and us (a &quot;Dispute&quot;), you
              agree to seek to resolve the matter with us amicably by referring the matter to{' '}
              <a href="mailto:legal@cow.fi" target="_blank" rel="nofollow noopener">
                legal@cow.fi
              </a>
              .
            </p>
            <p>
              For any claim not relating to or connected to the Interface please contact CoW DAO via CoW Forum at{' '}
              <a href="https://forum.cow.fi/" target="_blank" rel="nofollow noopener">
                https://forum.cow.fi/
              </a>{' '}
              with a detailed description, the date and time the issue arose, your handle to contact you on and the
              outcome you are seeking.
            </p>
            <h3 id="mediation-and-arbitration">Mediation and Arbitration</h3>
            <p>
              In the event a Dispute cannot be resolved amicably, you must first refer the Dispute to proceedings under
              the International Chamber of Commerce (&quot;ICC&quot;) Mediation Rules, which Rules are deemed to be
              incorporated by reference into this clause. The place of mediation shall be London, United Kingdom. The
              language of the mediation proceedings shall be English.
            </p>
            <p>
              If the Dispute has not been settled pursuant to the ICC Mediation Rules within forty (40) days following
              the filing of a Request for Mediation in accordance with the ICC Mediation Rules or within such other
              period as the parties to the Dispute may agree in writing, such Dispute shall thereafter be finally
              settled under the Rules of Arbitration of the International Chamber of Commerce by three (3) arbitrators
              appointed in accordance with the said Rules. The seat of Arbitration shall be London, United Kingdom. The
              governing law of this arbitration clause shall be the laws of England and Wales. The language of the
              arbitration shall be English. The Emergency Arbitrator Provisions shall not apply.
            </p>
            <h3 id="final-jurisdiction">Final Jurisdiction</h3>
            <p>
              If the Dispute cannot be resolved for legal reasons in accordance with the procedures described above, you
              and we agree that the courts of England and Wales shall have exclusive jurisdiction to resolve the
              Dispute.
            </p>
            <h3 id="no-class-action">No Class Action</h3>
            <p className={'warn'}>
              YOU AGREE AND UNDERSTAND THAT BY ENTERING INTO THIS AGREEMENT, YOU EXPRESSLY WAIVE ANY RIGHT, IF ANY, TO A
              TRIAL BY JURY AND RIGHT TO PARTICIPATE IN A CLASS ACTION LAWSUIT.
            </p>
            <h2 id="governing-law">Governing law</h2>
            <p>
              This Agreement shall be governed by and construed in accordance with the substantive laws of England &amp;
              Wales without regard to conflict of laws principles.
            </p>
            <h2 id="third-party-beneficiary">Third party beneficiary</h2>
            <p>
              Clauses 4 to 22 also apply to the benefit of the Affiliates and such benefit also encompasses
              Protocol-related matters.
            </p>
            <p>
              Subject to 20.1, these Terms do not give rise to any third party rights, which may be enforced against Us.
            </p>
            <h2 id="entire-agreement">Entire agreement</h2>
            <p>
              These Terms constitute the entire and exclusive agreement between us and you regarding its subject matter,
              and supersede and replace any previous or contemporaneous written or oral contract, promises, assurances,
              assurances, warranty, representation or understanding regarding its subject matter, whether written or
              oral. You shall have no claim for innocent or negligent misrepresentation or misstatement based on any
              statement in these Terms, though nothing in this clause shall limit or exclude any liability for fraud.
            </p>
            <h2 id="no-waiver-and-no-assignment">No waiver and no assignment</h2>
            <p>
              You may not assign, transfer or delegate any of your rights or duties arising out of or in connection with
              these Terms to a third party. Any such assignment or transfer shall be void and shall not impose any
              obligation or liability on us to the assignee or transferee.
            </p>
            <p>
              Any delay or omission by us in relation to the exercise of any right granted by law or under these Terms
              shall not as a result exclude or prevent the later exercise of such a right.
            </p>
            <h2 id="severability">Severability</h2>
            <p>
              If any provision or part-provision of these Terms is or becomes invalid, illegal or unenforceable, it
              shall be deemed modified to the minimum extent necessary to make it valid, legal and enforceable. If such
              modification is not possible, the relevant provision or part-provision shall be deemed deleted. Any
              modification to or deletion of a provision or part-provision under this clause shall not affect the
              validity and enforceability of the rest of these Terms.
            </p>{' '}
            <h2 id="base-token-reward">
              Terms and Conditions for Retroactive COW Token Reward for February Base Users
            </h2>
            <h3 id="base-token-reward-introduction">1. Introduction</h3>
            <p>
              This is a surprise, retroactive reward program to appreciate users who traded on CoW Swap on the Base
              network during February 2025. By being selected as a winner in this COW Token Reward, you acknowledge and
              agree to these Terms and Conditions. This is not a typical giveaway with an entry period, but a
              retroactive reward for past activity.
            </p>
            <h3 id="base-token-reward-eligibility">2. Eligibility</h3>
            <p>
              Must be a real user who conducted trades on CoW Swap on the Base Network during February 2025 and must:
            </p>
            <ul>
              <li>Be minimum 18 years of age;</li>
              <li>Not be an employee, affiliate, or immediate family member of the Organizer.</li>
            </ul>
            <h3 id="base-token-reward-period">3. Reward Period</h3>
            <p>
              This reward program is based on trading activity that occurred during the period from{' '}
              <strong>February 1st, 2025 to February 28th, 2025</strong> (the “Period”) on the Base Network using CoW
              Swap. This is a retroactive program and not an ongoing or future giveaway.
            </p>
            <h3 id="base-token-reward-how-to-enter">4. How to be Selected & Reward</h3>
            <ul>
              <li>
                <strong>No action is required from users to be considered for this reward.</strong> Users who traded on
                CoW Swap on the Base network in the Period are automatically considered for this retroactive reward;
              </li>
              <li>
                Three (3) users will be <strong>randomly selected</strong> from all users who traded on CoW Swap on Base
                during Period;
              </li>
              <li>
                Each of the three (3) selected users will receive a reward of <strong>1000 COW tokens;</strong>
              </li>
              <li>
                The reward will be sent to the wallet address used to trade on CoW Swap on Base during the Period.
              </li>
            </ul>
            <h3 id="base-token-winner-selection">5. Winner Selection Process</h3>
            <ul>
              <li>
                Winners will be <strong>randomly selected</strong> by the Organizer from the pool of unique wallet
                addresses that conducted valid trades on CoW Swap on the Base network during Period;
              </li>
              <li>The selection process will be conducted by the Organizer and is final and binding;</li>
              <li>
                Odds of being selected depend on the total number of unique users who traded on CoW Swap on Base during
                Period.
              </li>
            </ul>
            <h3 id="base-token-reward-distribution">6. Reward Distribution</h3>
            <p>
              The Organizer will make reasonable efforts to distribute the COW token rewards to the winning wallets.
            </p>
            <h3 id="base-token-reward-blockchain-privacy">7. Public Blockchain & Privacy</h3>
            <p>Users acknowledge that blockchain transactions are public and immutable.</p>
            <h3 id="base-token-reward-general-conditions">8. General Conditions</h3>
            <ul>
              <li>
                The Organizer reserves the right to modify, suspend, or cancel this reward program at any time for any
                reason, including but not limited to technical issues, security concerns, or regulatory changes;
              </li>
              <li>
                The Organizer is not responsible for any technical issues that may prevent the distribution of rewards
                or impact the announcement;
              </li>
              <li>
                Participation in trading on CoW Swap and potentially receiving this reward is subject to applicable laws
                and regulations. It is the user's responsibility to ensure their participation is legal in their
                jurisdiction;
              </li>
              <li>
                The recipient acknowledges that receiving the reward may trigger tax obligations for the recipient. The
                Organiser is not liable for any tax obligation resulting from the reception of the reward by the
                recipient;
              </li>
              <li>
                The Organizer's decisions regarding winner selection, reward distribution, and all other aspects of this
                reward program are final and binding.
              </li>
            </ul>
            <h3 id="base-token-reward-limitation">9. Limitation of Liability</h3>
            <ul>
              <li>
                To the maximum extent permitted by applicable law, the Organizer shall not be liable for any losses,
                damages, or liabilities arising out of or in connection with this reward program, the selection of
                winners, or the distribution of prizes;
              </li>
              <li>
                Participants acknowledge that the value of COW tokens can fluctuate and the Organizer is not responsible
                for any changes in token value;
              </li>
              <li>
                Receiving cryptocurrency and participating in DeFi activities involves risks, and participants are
                solely responsible for understanding and managing these risks.
              </li>
            </ul>
            <h3 id="base-token-reward-governing-law">10. Governing Law</h3>
            <p>
              These Terms and Conditions shall be governed by and construed in accordance with the laws of England and
              Wales, without regard to its conflict of law principles.
            </p>
          </BodyContent>
        </ArticleContent>
      </ContainerCard>
    </Wrapper>
  )
}
