import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/layout/LegalPage";
import { seller } from "@/data/seller";

export const metadata: Metadata = { title: "Privacy Policy" };

const UPDATED = "23 September 2026";

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated={UPDATED}
      intro={<>What personal data {seller.name} collects, why, who else handles it, and your rights under the GDPR.</>}
      sections={[
        {
          id: "controller",
          title: "Who is responsible",
          body: (
            <p>
              The data controller is <strong>{seller.name}</strong> ({seller.legalForm}, Business ID{" "}
              {seller.businessId}), {seller.postalCode} {seller.city}, {seller.country}. For anything
              about your data, email {seller.email}.
            </p>
          ),
        },
        {
          id: "what",
          title: "What is collected and why",
          body: (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>When</th>
                    <th>What</th>
                    <th>Why (legal basis)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>You join the email list or download a free tagged beat</td>
                    <td>Email address; which form you used; the consent wording you agreed to, with time and IP address; which beats you downloaded</td>
                    <td>Sending you emails you asked for — your consent. The consent record proves it.</td>
                  </tr>
                  <tr>
                    <td>You buy something</td>
                    <td>Name, email, billing country/address, what you bought, amount, order reference</td>
                    <td>Delivering your order and license — performing the contract. Bookkeeping — legal obligation.</td>
                  </tr>
                  <tr>
                    <td>You pay</td>
                    <td>Card and payment details</td>
                    <td>Handled entirely by Stripe; {seller.name} never sees or stores card numbers.</td>
                  </tr>
                  <tr>
                    <td>You contact me or make an offer</td>
                    <td>Name, email, your message, the beat and offer amount</td>
                    <td>Answering you — legitimate interest, or steps before a contract.</td>
                  </tr>
                  <tr>
                    <td>You browse the site</td>
                    <td>Standard server logs (IP address, browser, pages) kept briefly by the host</td>
                    <td>Running and securing the site — legitimate interest.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ),
        },
        {
          id: "processors",
          title: "Who else handles your data",
          body: (
            <>
              <p>Only services needed to run the store, each under a data processing agreement:</p>
              <ul>
                <li>
                  <strong>Stripe</strong> — payments and receipts (Stripe Payments Europe, Ireland).
                </li>
                <li>
                  <strong>Klaviyo</strong> — the email list, consent records and order emails (USA).
                </li>
                <li>
                  <strong>Vercel</strong> — hosting the website and storing purchased files (USA).
                </li>
                <li>
                  <strong>Zoner</strong> — domain and email hosting ({seller.country}).
                </li>
              </ul>
              <p>
                Where data goes to the USA, it is protected by the EU–US Data Privacy Framework and/or the EU Standard
                Contractual Clauses. Your data is never sold or rented to anyone.
              </p>
            </>
          ),
        },
        {
          id: "retention",
          title: "How long it's kept",
          body: (
            <ul>
              <li>
                <strong>Email list:</strong> until you unsubscribe. The consent record is kept a little longer as
                proof, then deleted.
              </li>
              <li>
                <strong>Orders:</strong> for the period Finnish accounting law requires for bookkeeping records
                (currently six years after the end of the financial year).
              </li>
              <li>
                <strong>Messages:</strong> as long as needed to handle the conversation, then deleted within 24 months.
              </li>
            </ul>
          ),
        },
        {
          id: "marketing",
          title: "Emails and unsubscribing",
          body: (
            <p>
              You only get marketing emails if you ticked the consent box. Buying something doesn&apos;t sign you up.
              Every email has an unsubscribe link that works in one click, and you can also just reply and ask.
            </p>
          ),
        },
        {
          id: "cookies",
          title: "Cookies and local storage",
          body: (
            <>
              <p>
                The site uses no tracking or advertising cookies and no analytics that follow you around. Your browser
                stores a few settings locally so the site works: your cart, your currency (EUR/USD), whether
                you&apos;ve already seen the email popup, and — after your first free download — your email address,
                so you aren&apos;t asked again. These stay on your device; clearing your browser data removes them.
              </p>
              <p>
                Stripe&apos;s checkout page sets its own cookies for fraud prevention while you pay. See{" "}
                <a href="https://stripe.com/privacy" target="_blank" rel="noreferrer">
                  Stripe&apos;s privacy policy
                </a>
                .
              </p>
            </>
          ),
        },
        {
          id: "rights",
          title: "Your rights",
          body: (
            <>
              <p>You can ask to:</p>
              <ul>
                <li>see what data is held about you and get a copy;</li>
                <li>correct anything that&apos;s wrong;</li>
                <li>have your data deleted, unless it must be kept by law (orders);</li>
                <li>restrict or object to how it&apos;s used;</li>
                <li>take your data to another service;</li>
                <li>withdraw consent at any time — this doesn&apos;t affect what happened before.</li>
              </ul>
              <p>
                Email {seller.email} and you&apos;ll get an answer within a month. If you think your data is being
                mishandled, you can complain to the{" "}
                <a href="https://tietosuoja.fi/en/home" target="_blank" rel="noreferrer">
                  Data Protection Ombudsman
                </a>{" "}
                in {seller.country}, or the authority where you live.
              </p>
            </>
          ),
        },
        {
          id: "changes",
          title: "Changes",
          body: (
            <p>
              If this policy changes in a way that matters, the date at the top changes and, for significant changes,
              subscribers get an email. Related: <Link href="/terms">Terms of Sale</Link>.
            </p>
          ),
        },
      ]}
    />
  );
}
