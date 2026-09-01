import Link from "next/link";

import { ArticleShell } from "@/components/sections/article-shell";
import { JsonLd } from "@/components/seo/json-ld";
import { ButtonLink } from "@/components/ui/button";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata = pageMetadata({
  title: "About Loan Calculator Pro",
  description:
    "Who builds Loan Calculator Pro, how the calculations work, where the interest rate data comes from, and how the site is funded.",
  path: "/about",
  keywords: ["about Loan Calculator Pro", "loan calculator India about", "how EMI calculator works"],
});

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />

      <ArticleShell
        breadcrumb="About"
        title={
          <>
            About <span className="gradient-text">Loan Calculator Pro</span>
          </>
        }
        lede="A loan calculator built to answer the questions that actually change what you pay — not just the monthly instalment."
      >
        <div className="prose-lcp">
          <h2>Why this exists</h2>
          <p>
            Most EMI calculators stop at one number. You put in an amount, a rate and a tenure, and
            you get a monthly figure. That is useful for about thirty seconds, and then the real
            questions start: what happens if I pay an extra ₹5 lakh in year three? Should the bank
            cut my tenure or my EMI? Is the lender quoting 8.40% with a 1% fee actually cheaper than
            the one quoting 8.55% with a flat fee?
          </p>
          <p>
            Those questions decide how much a loan costs over twenty years, and they are exactly the
            ones most tools cannot answer. Loan Calculator Pro was built to answer them.
          </p>

          <h2>How the calculations work</h2>
          <p>
            Every figure uses the reducing-balance method that Indian lenders apply: interest each
            month is charged on the outstanding balance, and whatever is left of your instalment
            reduces the principal. The instalment itself comes from the standard annuity formula,
            EMI = P × r × (1+r)<sup>n</sup> ÷ ((1+r)<sup>n</sup> − 1).
          </p>
          <p>
            Part-payments are applied after the month&rsquo;s instalment has posted, which is how
            lenders actually process them. Processing fees and GST are folded into a total cost
            figure so comparisons reflect what leaves your account rather than an advertised rate.
          </p>
          <p>
            What is <em>not</em> modelled: late-payment penalties, insurance bundled into the loan,
            foreclosure charges, moratorium periods, and the rate resets that come with floating
            benchmarks. Those vary too much between lenders to estimate honestly, so they are left
            out rather than guessed at.
          </p>

          <h2>Where the interest rates come from</h2>
          <p>
            Every rate in the tables is transcribed from the lender&rsquo;s own published page, and
            each row carries the date it was recorded plus a link back to that source so you can
            check it yourself. Rows that have not been verified are shown as{" "}
            <strong>&ldquo;Not published&rdquo;</strong> rather than filled with an estimate.
          </p>
          <p>
            We do not receive commission from any lender listed, there are no affiliate links, and
            the ordering of the tables is driven purely by rate — never by any commercial
            relationship, because there are none.
          </p>

          <h2>Your privacy</h2>
          <p>
            Every calculation runs in your browser. The loan amount you type, your salary, the rate
            you were quoted — none of it is transmitted to a server or stored anywhere. There is no
            account to create, no email required and no tracking cookie.
          </p>
          <p>
            We do count page views, using a random session identifier discarded when you close the
            tab and a one-way hash of your IP address that cannot be reversed. Visitors sending a Do
            Not Track signal are excluded entirely. The full detail is in the{" "}
            <Link href="/privacy-policy">privacy policy</Link>.
          </p>

          <h2>How the site is funded</h2>
          <p>
            Through advertising, served by Google AdSense. That is the whole business model. It is
            why the calculator is free, why there is no premium tier, and why we have no incentive
            to steer you toward any particular lender.
          </p>

          <h2>Corrections</h2>
          <p>
            If a figure looks wrong, a rate is out of date, or something is broken, tell us. Include
            the inputs you used and the result you expected, and it will be looked at.{" "}
            <Link href="/feedback">Send feedback</Link> or email{" "}
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href="/">Open the calculator</ButtonLink>
          <ButtonLink href="/feedback" variant="secondary">
            Send feedback
          </ButtonLink>
        </div>
      </ArticleShell>
    </>
  );
}
