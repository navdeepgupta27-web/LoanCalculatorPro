import { AdLeaderboard } from "@/components/ads/ad-slot";
import { ArticleShell } from "@/components/sections/article-shell";
import { JsonLd } from "@/components/seo/json-ld";
import { Accordion } from "@/components/ui/accordion";
import { ButtonLink } from "@/components/ui/button";
import { GENERAL_FAQS, LOAN_TYPE_FAQS } from "@/lib/faqs";
import { breadcrumbSchema, faqSchema, pageMetadata } from "@/lib/seo";
import { LOAN_TYPES } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Frequently Asked Questions — EMI, Part Payments & Loan Comparison",
  description:
    "How EMI is calculated, whether to cut tenure or EMI when you prepay, how processing fees and GST affect total cost, and what our bank rate tables do and do not tell you.",
  path: "/faq",
  keywords: [
    "EMI calculator FAQ",
    "how is EMI calculated",
    "reduce tenure or reduce EMI",
    "part payment vs prepayment",
    "loan processing fee GST",
    "home loan questions India",
  ],
});

/** Every question on the page, in one array, for the FAQPage schema. */
const ALL_FAQS = [...GENERAL_FAQS, ...LOAN_TYPES.flatMap((t) => LOAN_TYPE_FAQS[t.id])];

export default function FaqPage() {
  return (
    <>
      <JsonLd
        data={[
          faqSchema(ALL_FAQS),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "FAQ", path: "/faq" },
          ]),
        ]}
      />

      <ArticleShell
        breadcrumb="FAQ"
        title={
          <>
            Questions about <span className="gradient-text">loans and EMIs</span>
          </>
        }
        lede="The mechanics of Indian lending, the decisions that actually save money, and what this calculator can and cannot tell you."
      >
        <section aria-labelledby="general-faqs">
          <h2
            id="general-faqs"
            className="mb-5 font-display text-xl font-bold text-[var(--text)] sm:text-2xl"
          >
            General questions
          </h2>
          <Accordion items={GENERAL_FAQS} />
        </section>

        <AdLeaderboard className="my-10" />

        {LOAN_TYPES.map((type) => (
          <section key={type.id} className="mt-10" aria-labelledby={`faq-${type.id}`}>
            <h2
              id={`faq-${type.id}`}
              className="mb-5 flex items-center gap-2 font-display text-xl font-bold text-[var(--text)] sm:text-2xl"
            >
              <span>{type.emoji}</span> {type.label}
            </h2>
            <Accordion items={LOAN_TYPE_FAQS[type.id]} defaultOpen={null} />
            <div className="mt-4">
              <ButtonLink href={`/${type.slug}`} variant="ghost" size="sm">
                Open the {type.label.toLowerCase()} calculator →
              </ButtonLink>
            </div>
          </section>
        ))}

        <section className="mt-12 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-6 text-center">
          <h2 className="font-display text-lg font-bold text-[var(--text)]">
            Question not answered here?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--text-secondary)]">
            Ask it directly — questions that come up more than once usually end up on this page.
          </p>
          <ButtonLink href="/feedback" className="mt-4">
            Ask a question
          </ButtonLink>
        </section>
      </ArticleShell>
    </>
  );
}
