import Head from 'next/head'
import Layout from '@/components/Layout'
import { GetStaticProps } from 'next'
import { CONFIG } from '@/const/meta'
import styled from 'styled-components'
import { Color } from '@/styles/variables'

const DATA_CACHE_TIME_SECONDS = 5 * 60 // Cache 5min

const Content = styled.div`
  display: block;
  max-width: 126rem;
  margin: 0 auto;
  padding: 0 20px;
  color: ${Color.darkBlue};

  h1,
  h2,
  h3 {
    margin: 20px 0 10px 0;
  }

  h1,
  h2,
  h3,
  p,
  div,
  a {
    line-height: normal !important;
  }

  p {
    padding-top: 10px;
  }
`

export default function TermsAndConditionsPage({siteConfigData}) {
  const pageTitle = `Widget - ${siteConfigData.title}`
  const pageDescription =
    'Integrate the CoW Swap widget to bring seamless, MEV-protected trading to your website or dApp.'

  return (
    <Layout fullWidthGradientVariant>
      <Head>
        <title>{pageTitle}</title>
        <meta key="description" name="description" content={pageDescription}/>
        <meta key="ogTitle" property="og:title" content={pageTitle}/>
        <meta key="ogDescription" property="og:description" content={pageDescription}/>
        <meta key="twitterTitle" name="twitter:title" content={pageTitle}/>
        <meta key="twitterDescription" name="twitter:description" content={pageDescription}/>
      </Head>

      <Content>
        <div>
          <h1>Terms and Conditions for the CoW Swap Widget &amp; Partner Fee Program</h1>
          <p>
            These Terms and Conditions (the "Terms") govern the integration of the CoW Swap Widgetr (the "Widget"). The
            Widget is provided to you ("you", the "Partner") by CoW DAO (the "Provider", "we", "our", or "us").
          </p>
          <p>
            CoW DAO is an Ethereum and Gnosis Chain based collective managed by community members in accordance with the
            CoW DAO's{' '}
            <a target="_blank" rel="noreferrer" href="https://snapshot.org/#/cow.eth/about">
              participation agreement
            </a>
            . To contact CoW DAO please use the forum at{' '}
            <a target="_blank" rel="noreferrer" href="https://forum.cow.fi/">
              https://forum.cow.fi/
            </a>
            .
          </p>
          <p>
            By integrating and using the Widget, Partner acknowledges that it has read, understood, and agreed to be
            bound by these Terms and Conditions.
          </p>
          <h2>Acceptance of these Terms</h2>
          <p>
            By integrating and using the Widget, you confirm that you accept these Terms and agree to comply with them.
            If you do not agree, you must not integrate the Widget. If you think that there is an error in these Terms,
            please contact us at{' '}
            <a href="mailto:legal@cow.fi" target="_blank" rel="noreferrer">
              legal@cow.fi
            </a>
            .
          </p>
          <p>
            You are also responsible for ensuring that all persons who access the Widget through your website are aware
            of the{' '}
            <a target="_blank" rel="noreferrer" href="https://swap.cow.fi/#/terms-and-conditions">
              Terms &amp; Conditions
            </a>{' '}
            of{' '}
            <a target="_blank" rel="noreferrer" href="https://cow.fi/">
              https://cow.fi/
            </a>{' '}
            and that they comply with them.
          </p>
          <p>
            We may terminate or suspend your access to the Widget immediately, without prior notice or liability, if you
            breach any clause of the Terms. Upon termination of your access, your right to access the website or use the
            Products will immediately cease.
          </p>
          <h2>Change of these Terms</h2>
          <p>
            We may amend these Terms at our sole discretion. We regularly do so. Every time you wish to access the
            Website or use the Products, please check these Terms to ensure you understand the terms that apply at that
            time.
          </p>
          <h2>CoW Protocol</h2>
          <p>
            Cow Protocol (the "Protocol") is a decentralised protocol operated by CoW DAO on the Ethereum, Gnosis Chain
            as well as other EVM compatible chains that allows users to trade certain digital assets. The Protocol is a
            set of smart contracts owned by CoW DAO.
          </p>
          <p>
            CoW Protocol applies batch auction mechanisms to allow peer-to-peer trades on Ethereum Mainnet, and Ethereum
            Virtual Machine compatible validation mechanisms. CoW DAO is not custodians or counterparties to any
            transactions executed by you on the Protocol. We do not support any other service, particularly we do not
            provide any order matching, guaranteed prices, or similar exchange or trading platform services.
          </p>
          <p>
            Please consult our{' '}
            <a target="_blank" rel="noreferrer" href="https://docs.cow.fi/cow-protocol">
              documentation
            </a>{' '}
            for more information on CoW Protocol.
          </p>
          <h2>The Widget</h2>
          <p>
            The Widget is an iframe solution mirroring the web-hosted user interface (the "Interface") published at{' '}
            <a target="_blank" rel="noreferrer" href="https://swap.cow.fi/">
              https://swap.cow.fi/
            </a>{' '}
            and providing access to CoW Protocol and allowing users to submit orders into the Interface and exchange
            compatible tokens using the unique features of the Protocol.
          </p>
          <p>
            Please consult our documentation for more information on{' '}
            <a target="_blank" rel="noreferrer" href="https://docs.cow.fi/cow-protocol/tutorials/widget">
              CoW Widget
            </a>{' '}
            and the Interface.
          </p>
          <p>
            The{' '}
            <a target="_blank" rel="noreferrer" href="https://swap.cow.fi/#/terms-and-conditions#welcometohttpscowfi">
              Terms &amp; Conditions
            </a>{' '}
            for the use of the Interface apply to the Widget. It is your duty to ensure that all persons who access the
            Widget through your website are aware of the Interface’s{' '}
            <a target="_blank" rel="noreferrer" href="https://swap.cow.fi/#/terms-and-conditions">
              Terms &amp; Conditions
            </a>{' '}
            and that they comply with them.
          </p>
          <h2>Widget Integration</h2>
          <p>
            The Partner may integrate the Widget into their website or application in accordance with the Provider's
            integration guidelines and these Terms.
          </p>
          <p>
            The Partner may customize the design and appearance of the Widget within reasonable limits, provided that
            the Provider's branding and logos remain visible.
          </p>
          <h2>Obligations of the Partner</h2>
          <p>
            You are prohibited from misusing the the Widget, the Interface, the Protocol or its infrastructure by
            knowingly introducing any material that is:
          </p>
          <ul>
            <li>Malicious, including viruses, worms, Trojan horses, and other harmful software;</li>
            <li>
              Technologically harmful, including attempts to disrupt or damage the Widget, the Interface, the Protocol
              or its infrastructure.
            </li>
          </ul>
          <p>You are prohibited from attempting to gain unauthorized access to the:</p>
          <ul>
            <li>the Widget, the Interface, the Protocol or its infrastructure;</li>
            <li>Server(s) hosting the the Widget, the Interface, the Protocol or its infrastructure;</li>
            <li>
              Any computer or database connected to the the Widget, the Interface, the Protocol or its infrastructure.
            </li>
          </ul>
          <p>
            You are prohibited from attacking the the Widget, the Interface, the Protocol or its infrastructure through:
          </p>
          <ul>
            <li>Denial-of-service attacks;</li>
            <li>Distributed denial-of-service attacks;</li>
            <li>You acknowledge that any breach of this clause may constitute a criminal offense.</li>
          </ul>
          <h2>License and Ownership</h2>
          <p>
            The Provider grants the Partner a limited, non-exclusive, non-transferable, revocable license to integrate
            and use the Widget solely for the purpose of providing access to the Interface to the Partner's users.
          </p>
          <p>
            The Widget and all intellectual property rights therein are and shall remain the exclusive property of the
            Provider.
          </p>
          <h2>Partner Fee Program</h2>
          <h3>Partner Fee</h3>

          <p>Partners may participate in the Provider's Partner Fee Program ("Program"). The Program enables Partners to
            earn fees on trades their users execute through the Widget. For comprehensive details and conditions of the
            Partner Fee Program, please refer to the dedicated <a target="_blank" rel="noreferrer" href="https://docs.cow.fi/cow-protocol/tutorials/widget#partner-fee">
              Widget documentation page under the "Partner Fee" section
            </a>.</p>
          <p>To list a token on the Widget and earn fees on associated transactions, the token must have a listing on <a target="_blank" rel="noreferrer" href="https://www.coingecko.com">https://www.coingecko.com/</a>
            {' '}as it appears on the site.</p>
          <h3>Service Fee</h3>
          <p>The Provider will retain a service fee ("Service Fee") from the total fees earned by the Partner. Specific
            terms and conditions regarding the Service Fee are outlined in the <a target="_blank" rel="noreferrer" href="https://docs.cow.fi/cow-protocol/tutorials/widget#partner-fee">
              Widget's dedicated documentation page under the "Partner Fee" section</a>.</p>
          <p>The Provider reserves the right to adjust the Service Fee charged to the Partner with prior notice.</p>
          <h3>Partner Fee Payment at the Provider’s Discretion</h3>
          <p>The Provider retains sole and absolute discretion in determining whether the transactions on the Widget are
            eligible for Partner Fee. The Provider may choose not to issue Partner Fees for any reason, including but
            not limited to:</p>
          <ul>
            <li>Suspected Fraud or Scam Activity: Transactions involving tokens deemed fraudulent or potentially
              involved in scams;
            </li>
            <li>Abnormal or Manipulative Trading: Trading activity aimed at exploiting the Widget or Partner Fee
              program;
            </li>
            <li>Other Inappropriate Activity: Any other scenarios where the Provider considers Partner Fee payment to be
              unsuitable or against the best interests of the Widget or Program.
            </li>
          </ul>

          <h3>Program Changes and Termination</h3>
          <p>The Provider may make amendments to the Program at any time. Additionally, the Provider reserves the right
            to modify or terminate the Program at any time, with or without notice.</p>

          <h2>Warranties and Limitations</h2>
          <p>The Widget is provided "as is" without warranty of any kind, express or implied.</p>
          <p>
            Provider shall not be liable for any damages or losses arising from the use or inability to use the Widget,
            including but not limited to direct, indirect, incidental, consequential, or punitive damages.
          </p>
          <p>
            The Partner is solely responsible for ensuring compliance with all applicable laws and regulations in their
            jurisdiction.
          </p>
          <h2>Indemnification</h2>
          <p>
            The Partner shall indemnify, defend, and hold harmless the Provider, its affiliates, and their agents from
            and against any and all claims, liabilities, damages, losses, and expenses, including reasonable attorneys'
            fees and costs, arising out of or relating to the Partner's use of the Widget or breach of these Terms.
          </p>
          <h2>Breach of Terms</h2>
          <p>
            In the event of a breach of these Terms, the Provider may immediately terminate your use of the Widget or
            participation in the Program without notice.
          </p>
          <h2>Termination</h2>
          <p>
            The&nbsp; Provider may terminate this Agreement at any time and revoke the Partner's license to use the
            Widget at any time, with or without cause, upon written notice to Partner.
          </p>
          <p>
            Upon termination, the Partner shall immediately cease all use of the Widget and remove it from its website
            or application.
          </p>
          <h2>Dispute Resolution</h2>
          <h3>Amicable Dispute Resolution</h3>
          <p>
            If an alleged breach, controversy, claim, dispute or difference arises out of or in connection with the
            present Terms about or in connection to the Widget between you and us (a "Dispute"), you agree to seek to
            resolve the matter with us amicably by referring the matter to{' '}
            <a href="mailto:legal@cow.fi" target="_blank" rel="noreferrer">
              legal@cow.fi
            </a>
            .
          </p>
          <p>
            For any claim not relating to or connected to the Widget please contact CoW DAO via CoW Forum at{' '}
            <a target="_blank" rel="noreferrer" href="https://forum.cow.fi/">
              https://forum.cow.fi/
            </a>{' '}
            with a detailed description, the date and time the issue arose, your handle to contact you on and the
            outcome you are seeking.
          </p>
          <h3>Mediation and Arbitration</h3>
          <p>
            In the event a Dispute cannot be resolved amicably, you must first refer the Dispute to proceedings under
            the International Chamber of Commerce ("ICC") Mediation Rules, which Rules are deemed to be incorporated by
            reference into this clause. The place of mediation shall be London, United Kingdom. The language of the
            mediation proceedings shall be English.
          </p>
          <p>
            If the Dispute has not been settled pursuant to the ICC Mediation Rules within forty (40) days following the
            filing of a Request for Mediation in accordance with the ICC Mediation Rules or within such other period as
            the parties to the Dispute may agree in writing, such Dispute shall thereafter be finally settled under the
            Rules of Arbitration of the International Chamber of Commerce by three (3) arbitrators appointed in
            accordance with the said Rules. The seat of Arbitration shall be London, United Kingdom. The governing law
            of this arbitration clause shall be the laws of England and Wales. The language of the arbitration shall be
            English. The Emergency Arbitrator Provisions shall not apply.
          </p>
          <h3>Final Jurisdiction</h3>
          <p>
            If the Dispute cannot be resolved for legal reasons in accordance with the procedures described above, you
            and we agree that the courts of England and Wales shall have exclusive jurisdiction to resolve the Dispute.
          </p>
          <h2>Miscellaneous</h2>
          <h3>Entire agreement</h3>
          <p>
            These Terms constitute the entire and exclusive agreement between us and you regarding its subject matter,
            and supersede and replace any previous or contemporaneous written or oral contract, promises, assurances,
            assurances, warranty, representation or understanding regarding its subject matter, whether written or oral.
            You shall have no claim for innocent or negligent misrepresentation or misstatement based on any statement
            in these Terms, though nothing in this clause shall limit or exclude any liability for fraud.
          </p>
          <h3>No waiver and no assignment</h3>
          <p>
            You may not assign, transfer or delegate any of your rights or duties arising out of or in connection with
            these Terms to a third party. Any such assignment or transfer shall be void and shall not impose any
            obligation or liability on us to the assignee or transferee.
          </p>
          <p>
            Any delay or omission by us in relation to the exercise of any right granted by law or under these Terms
            shall not as a result exclude or prevent the later exercise of such a right.
          </p>
          <h3>Severability</h3>
          <p>
            If any provision or part-provision of these Terms is or becomes invalid, illegal or unenforceable, it shall
            be deemed modified to the minimum extent necessary to make it valid, legal and enforceable. If such
            modification is not possible, the relevant provision or part-provision shall be deemed deleted. Any
            modification to or deletion of a provision or part-provision under this clause shall not affect the validity
            and enforceability of the rest of these Terms.
          </p>
          <h3>Governing law</h3>
          <p>
            This Agreement shall be governed by and construed in accordance with the substantive laws of England &amp;
            Wales without regard to conflict of laws principles.
          </p>
        </div>
      </Content>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const siteConfigData = CONFIG

  return {
    props: {
      siteConfigData,
    },
    revalidate: DATA_CACHE_TIME_SECONDS,
  }
}
