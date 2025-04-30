'use client'

import { Color } from '@cowprotocol/ui'
import { useCowAnalytics } from '@cowprotocol/analytics'
import { CowFiCategory } from 'src/common/analytics/types'
import styled from 'styled-components/macro'
import { ContainerCard, ArticleContent, Breadcrumbs, ArticleMainTitle, BodyContent } from '@/styles/styled'

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

  return (
    <Wrapper>
      <ContainerCard bgColor={Color.neutral100} minHeight="70vh" gap={62} gapMobile={42} centerContent touchFooter>
        <ArticleContent maxWidth="100%">
          <Breadcrumbs>
            <a
              href="/careers"
              onClick={() =>
                analytics.sendEvent({
                  category: CowFiCategory.CAREERS,
                  action: 'Click Breadcrumb',
                  label: 'careers',
                })
              }
            >
              Careers
            </a>
            <span>Refer-to-Earn</span>
          </Breadcrumbs>

          <ArticleMainTitle fontSize={52}>Refer-to-Earn</ArticleMainTitle>

          <BodyContent>
            <h2>
              Know someone who is not just looking for a job but for a great opportunity to grow? Refer them to us to
              earn up to $6,000 in USDC or USD
            </h2>
            <p>
              We will reward you with a referral bonus of up to <b>6,000 USDC or USD</b> per placement. The referral
              bonus amount can vary for each role. You can find the exact amount listed in the job description on our
              website at <a href="https://cow.fi/careers">https://cow.fi/careers</a>. Your referral is successful and
              paid once the Candidate clears <b>their first 6 months</b> of work in their new role.
            </p>

            <p>
              Sounds like a long time to wait? Allow us to explain! 😊 At CoW, we prioritize quality and make
              substantial investments in our people. We consider this our utmost priority and exercise great caution
              when onboarding new individuals. We genuinely care about ensuring that we bring on board the right people
              who align with our values and goals.
              <br />
              <br />
              <b>
                Have Questions? Ask us at{' '}
                <a href="mailto:jobs@cow.fi" target="_blank" rel="noreferrer">
                  jobs@cow.fi
                </a>
              </b>
            </p>

            <h3>Conditions:</h3>
            <p>Referrer Eligibility. Who is eligible to participate in this Program?</p>
            <ul>
              <li>Individuals (or entities) who are not currently engaged in providing contracting services to CoW.</li>
              <li>
                Individuals (or entities) who are not affiliated with, employed by, or acting as consultants for
                staffing or recruiting agencies or any other third party for CoW at the time of making referrals or
                receiving payments for such referrals.
              </li>
              <li>Individuals (or entities) must not act against any laws or regulations when participating.</li>
              <li>The Referrer must provide a proper invoice for payment, complying with Portuguese rules.</li>
              <li>
                This must be the <b>first</b> submission, if the Candidate has previously applied or been referred by
                someone else first, the Referrer is not eligible.
              </li>
              <li>
                If two or more Referrers refer the same Candidate, only the <b>first</b> Referrer provided by such
                Candidate will be eligible for the referral bonus. We will let the Referrers know.
              </li>
              <li>There is no limit to the number of referrals that a Referrer can make.</li>
            </ul>

            <h4>Candidates Eligibility</h4>
            <ul>
              <li>Any individual (or entity) who is not the Referrer or a current or former contractor of CoW.</li>
              <li>
                Any individual who is not bound by non-compete agreements or any other similar agreements that would
                prohibit CoW from engaging with them.
              </li>
            </ul>

            <h4>Referral Procedures</h4>
            <ul>
              <li>
                The referrer should reach out to a CoW core team member or directly contact the People department via
                email at <a href="mailto:jobs@cow.fi">jobs@cow.fi</a>, LinkedIn, or Telegram. When reaching out, the
                Referrer must include the candidate's name, surname, and email or LinkedIn profile. The Referrer is
                responsible for ensuring that the Candidate has given consent to share this information.
              </li>
              <li>
                To apply for a specific role at CoW, <b>Candidates</b> are required to submit their application through
                the official website: <a href="https://cow.fi/careers">https://cow.fi/careers</a>.{' '}
                <b>
                  When applying, Candidates must mention the name and email of the person (or entity) who referred them.
                </b>{' '}
                Candidates are responsible for ensuring that the Referrer has given consent to share this information.
              </li>
              <li>
                If a Candidate receives a job offer from CoW and accepts it, CoW will inform the Referrer about the
                Candidate&apos;s status and the timeline for the start date. Referrers should not contact CoW requesting
                such information.
              </li>
              <li>
                CoW is not obligated to disclose the reason for rejecting a Candidate to a Referrer or to inform them if
                the Candidate was not selected for the next steps in the interview process.
              </li>
              <li>Referrers should not directly submit Candidate information to CoW.</li>
            </ul>

            <h4>Referral bonus and invoice</h4>
            <ul>
              <li>
                The Referrer becomes eligible to receive the full referral bonus up to six thousand USDC or USD (6,000)
                after six (6) months from the Candidate's start date, provided that the Candidate remains providing
                services to CoW during this period. The referral bonus amount can vary for each role. You can find the
                exact amount listed in the job description on our website at{' '}
                <a href="https://cow.fi/careers">https://cow.fi/careers</a>. The Referrer can decide if they want to be
                paid in USDC or USD.
              </li>
              <li>
                The referral bonus is excl. VAT (VAT can be added), but net of any other tax, such as, income tax or
                withholding tax.
              </li>
              <li>
                The referral bonus will be paid to the Referrer within thirty (30) days receiving a legally compliant
                invoice (incl. Name, Address and VAT number, either USDC-Ethereum address or IBAN) of the Referrer.
              </li>
              <li>The Referrer assumes full responsibility for any tax obligations arising from the referral bonus.</li>
            </ul>

            <h4>Miscellaneous Rules</h4>
            <ul>
              <li>
                Contracting to CoW includes a number of routes, including EORs. Grants (other than core contributors)
                are not counted into these routes and Grant recipients are eligible to make referrals.
              </li>
              <li>The decision regarding the Candidate&apos;s submission order is based solely on our judgment.</li>
              <li>
                We can terminate this program at any point in time and at our sole discretion, without notice. Of
                course, presently referred Candidates remain part of the program.
              </li>
              <li>
                The conditions of the referral program will be shared via email with the Referrer, and we will require
                confirmation by responding to the email once a Candidate accepts a Job Offer. Unfortunately, the
                Referrer will not qualify for a bonus if we do not receive this confirmation.
              </li>
            </ul>
          </BodyContent>
        </ArticleContent>
      </ContainerCard>
    </Wrapper>
  )
}
