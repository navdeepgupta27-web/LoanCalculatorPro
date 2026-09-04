/**
 * Publishes the second batch of guides.
 *
 *   npm run db:guides
 *
 * Idempotent: posts are matched on slug, so re-running adds nothing. Run it
 * against production the same way as the seed, by pointing DATABASE_URL and
 * DATABASE_AUTH_TOKEN at Turso.
 *
 * Every rupee figure below was produced by this repository's own engine — run
 * `npm run guide:figures` to reproduce them.
 */
import { all, run } from "../lib/db";

interface Guide {
  slug: string;
  title: string;
  excerpt: string;
  coverVariant: string;
  tags: string;
  keywords: string;
  seoDescription: string;
  content: string;
}

const GUIDES: Guide[] = [
  {
    slug: "reduce-tenure-or-reduce-emi",
    title: "Cut the tenure or cut the EMI? The choice is worth ₹9.79 lakh",
    excerpt:
      "When you make a part-payment your bank asks a question most people answer in five seconds. On a ₹50 lakh loan, the two answers differ by nearly ₹10 lakh.",
    coverVariant: "violet",
    tags: "home loan, prepayment, part payment",
    keywords:
      "reduce tenure or reduce EMI, tenure reduction vs EMI reduction, part payment calculator, home loan prepayment options",
    seoDescription:
      "Cutting the tenure saves ₹14,57,301 in interest. Cutting the EMI on the identical prepayment saves ₹4,77,894. Here is why the gap is so large, and when the smaller saving is still the right call.",
    content: `You make a part-payment. Somewhere in the form, your lender asks whether you want to **reduce the tenure** or **reduce the EMI**.

Most people pick without much thought. On a typical home loan the two answers are nearly ₹10 lakh apart.

## The same money, two outcomes

Take a **₹50,00,000 loan at 8.5% over 20 years**. The EMI is **₹43,391**, and left alone the loan costs **₹54,13,879** in interest.

Now pay **₹5,00,000** extra in month 24 — the start of year three.

| | Cut the tenure | Cut the EMI |
| --- | --- | --- |
| Interest paid | ₹39,56,578 | ₹49,35,985 |
| **Interest saved** | **₹14,57,301** | **₹4,77,894** |
| Monthly EMI after | ₹43,391 (unchanged) | ₹38,864 |
| Loan ends | 3 yr 9 mo early | on the original date |

**The gap is ₹9,79,407.** Same loan, same ₹5 lakh, same month. The only difference is which box you ticked.

## Why the difference is so large

Interest accrues on time as much as on money. Cutting the tenure removes 45 months from the end of the loan — 45 instalments that never happen, each one still carrying interest.

Cutting the EMI keeps all 240 months. You simply pay a little less each month, so the balance falls more slowly, and interest keeps accruing across the full original term. You get ₹4,527 a month back in your pocket, but you pay for that convenience.

> Cutting the tenure returns ₹14.57 lakh on a ₹5 lakh payment — roughly three times the money back, guaranteed, tax-free.

## So when is cutting the EMI right?

Not never. It is the right choice when **monthly cash flow is the binding constraint**, not total cost.

- Your income has dropped or become less certain, and a lower fixed obligation reduces the risk of default. Missing EMIs is far more expensive than the interest you would have saved.
- You are taking on another large commitment — school fees, a second loan, a medical cost — and need the headroom.
- The lower EMI lets you build an emergency fund you do not currently have. Liquidity has real value that this arithmetic does not capture.

What it should **not** be chosen for is comfort. If you can keep paying ₹43,391 without strain, keeping it is worth ₹9.79 lakh.

## A middle path most people miss

You can cut the tenure now and ask to reduce the EMI later if circumstances change. Most lenders will restructure on request. The reverse — asking to shorten a term you already extended — usually means a fresh application.

Take the larger saving while you can afford it. It is easier to give back than to claw back.

## Check it on your own numbers

The gap scales with your balance and your remaining term. On a smaller loan or later in the term it narrows considerably; prepay in year twelve rather than year two and the whole effect shrinks.

Put your actual figures into the [home loan calculator](/home-loan-emi-calculator), add your part-payment, and switch between the two modes. The savings box updates immediately, so you can see your own version of that ₹9.79 lakh before you tell the bank which one you want.

## Before you commit

Check your loan agreement for prepayment charges. Floating-rate home loans to individuals generally carry none in India, but fixed-rate loans and most non-housing loans do. And do not empty an emergency fund to prepay — money handed to the bank is gone, and a job loss six months later costs far more than the interest you saved.

*General information about how loan arithmetic works, not financial advice. Your circumstances and your loan agreement both matter — check with your lender.*`,
  },

  {
    slug: "home-loan-balance-transfer-worth-it",
    title: "Is a home loan balance transfer worth it? Do this calculation first",
    excerpt:
      "Moving a ₹47 lakh balance from 9.25% to 8.5% saves ₹4,40,541 in interest — but ₹37,733 of it goes straight back out in switching costs. Here is how to work out your own number.",
    coverVariant: "sky",
    tags: "home loan, balance transfer, refinancing",
    keywords:
      "home loan balance transfer, is balance transfer worth it, refinance home loan India, balance transfer calculator, switching home loan lender",
    seoDescription:
      "A worked balance transfer: ₹47,00,442 outstanding moved from 9.25% to 8.5% saves ₹4,02,808 net of costs. The arithmetic, the fees people forget, and when it is not worth it.",
    content: `A rival bank offers to take over your home loan at a lower rate. The pitch always leads with the monthly saving. The number that matters is the one after costs.

## A worked example

You borrowed **₹50,00,000 at 9.25% over 20 years**. The EMI is **₹45,793**. Three years in, you have paid down to an outstanding balance of **₹47,00,442** — barely ₹3 lakh off the principal, because the early years are mostly interest.

Stay put and the remaining 17 years cost you **₹46,41,400** in interest.

Another lender offers **8.5%** on the same balance and remaining term:

| | Stay | Transfer |
| --- | --- | --- |
| EMI | ₹45,793 | ₹43,634 |
| Interest still to pay | ₹46,41,400 | ₹42,00,859 |

**Gross interest saved: ₹4,40,541.** Monthly saving: ₹2,160.

## Now subtract what it costs to move

This is the part the sales call skips. On a 0.5% processing fee plus GST, and ₹10,000 of legal and valuation charges:

| Cost | Amount |
| --- | --- |
| Processing fee (0.5% of ₹47,00,442) | ₹23,502 |
| GST at 18% | ₹4,230 |
| Legal, valuation, documentation | ₹10,000 |
| **Total** | **₹37,733** |

**Net saving: ₹4,02,808.**

Still clearly worth doing — but the costs ate roughly 8.6% of the benefit, and on a smaller rate gap they can eat all of it.

## The rule of thumb, and why it is only a rule of thumb

You will hear "transfer if the gap is at least 0.5%". That is a reasonable starting filter, but the real answer depends on three things the rule ignores:

**How much term is left.** A rate saving compounds over remaining years. With 17 years to run, a 0.75% gap is decisive. With four years left, the same gap moves very little while the fees stay the same.

**How large the balance is.** Fees scale with the balance; so does the saving. But flat charges — legal, valuation — hurt small balances disproportionately.

**Whether you reset the tenure.** This is the trap. Many transfers quietly restart the clock at 20 years. Your EMI drops pleasingly and your total cost goes *up*. In the example above the term stays at the remaining 17 years. If it reset to 20, the comparison is meaningless.

## Questions to ask before signing

1. **What is the all-in cost in rupees?** Processing fee, GST, legal, valuation, CERSAI, stamp duty on the new mortgage. Get a number, not percentages.
2. **What tenure is the new loan?** It must match your remaining term for the saving to be real.
3. **Is the rate a teaser?** Some offers are low for 12–24 months and then revert. Ask what the spread over the benchmark is, because that is what you actually keep.
4. **Is any insurance bundled?** Loan protection premiums are frequently added to the transferred amount.
5. **What does my current lender say?** Often the cheapest transfer is the one you do not make — ask your existing lender to match. A rate reduction on your current loan usually costs a small conversion fee and none of the legal work.

That last point is worth trying first. It costs one phone call.

## Run your own numbers

You need your **current outstanding balance** and your **remaining tenure** — both on your latest statement — not the original loan amount. Put the outstanding balance into the [home loan calculator](/home-loan-emi-calculator) at your current rate and remaining term, note the interest, then change the rate and compare. Subtract the switching costs from the difference.

If the answer is close, it is not worth the paperwork. If it looks like the example above, it is.

*General information, not financial advice. Fees and terms vary by lender and by borrower — confirm everything in writing before you commit.*`,
  },

  {
    slug: "what-a-small-interest-rate-difference-costs",
    title: "What 0.25% actually costs you on a home loan",
    excerpt:
      "A quarter of a percent sounds like a rounding error. On a ₹50 lakh 20-year loan it is ₹1,90,650 — and negotiating it away takes one conversation.",
    coverVariant: "amber",
    tags: "home loan, interest rates, negotiation",
    keywords:
      "home loan interest rate difference, does 0.25 percent matter home loan, negotiate home loan rate, lower home loan interest rate",
    seoDescription:
      "On a ₹50 lakh 20-year home loan, 0.25% extra costs ₹1,90,650 and 1% costs ₹7,71,695. Why small rate differences are worth arguing about, and how to actually get one.",
    content: `Rate quotes get discussed in decimals, which makes them sound trivial. Converted into rupees they stop sounding trivial.

## The numbers

A **₹50,00,000 home loan over 20 years**, starting from 8.5% — EMI ₹43,391:

| Rate | EMI | Extra per month | Extra interest over the term |
| --- | --- | --- | --- |
| 8.50% | ₹43,391 | — | — |
| 8.75% | ₹44,186 | ₹794 | **₹1,90,650** |
| 9.00% | ₹44,986 | ₹1,595 | **₹3,82,833** |
| 9.50% | ₹46,607 | ₹3,215 | **₹7,71,695** |

A quarter of a percent is ₹1.9 lakh. A full percent is ₹7.7 lakh — more than most people's annual salary, on a difference that fits in a single decimal place.

Note also that the monthly figures are small enough to ignore. ₹794 a month is genuinely unnoticeable. That is exactly why the total is so easy to overlook.

## Why lenders have room to move

Advertised rates are the floor for a lender's best borrowers. What you are offered is that floor plus a spread reflecting your credit score, income stability, employer category, loan-to-value ratio and existing relationship.

The spread is a judgement, not a formula, and judgements can be argued with. Relationship managers frequently hold discretion of 10–25 basis points, and more when they think they will lose the file to a competitor.

## Five things that genuinely move the rate

**A written competing offer.** By far the most effective. Not "another bank said they'd do better" — an actual sanction letter or written quote. Lenders match to avoid losing a booked loan.

**Your credit score.** The single largest input into your spread. Check it before you apply, not after. If it is borderline, spending three months clearing balances and disputing errors can be worth more than any negotiation.

**A lower loan-to-value ratio.** Borrowing 70% of the property value rather than 85% moves you into a better risk band. If you can find a slightly larger down payment, it often pays for itself.

**Your salary account and employer.** Banks price existing customers better, and employer category matters more than people expect at large lenders.

**Asking at the right moment.** Rates are most negotiable just before disbursement, when the lender has invested effort in your file and does not want to lose it — not at the enquiry stage.

## Fixed versus floating

Most Indian home loans are floating, linked to an external benchmark such as the RBI repo rate. When the benchmark moves, your EMI or tenure moves with it.

That cuts both ways, and it means a rate you are quoted today is a starting point rather than a twenty-year commitment. What you are really negotiating is the **spread over the benchmark**, because that part stays with you. Ask what the spread is, not just the headline rate.

## Do the comparison properly

A lower rate with a larger processing fee is not automatically cheaper — on shorter tenures the fee can outweigh the rate entirely. Our guide on [why the lowest rate is often the dearer loan](/blog/lowest-interest-rate-is-not-cheapest-loan) works through a case where the ranking flips.

To compare offers on total outflow rather than headline rate, put them side by side in the [comparison tool](/compare-loans). And to see what a specific rate does to your own loan, the [home loan calculator](/home-loan-emi-calculator) will show you the interest column directly.

Then go and have the conversation. It is the best-paid twenty minutes available to most borrowers.

*General information, not financial advice. The rate you are offered depends on your own profile and the lender's policy at the time.*`,
  },

  {
    slug: "how-to-read-an-amortisation-schedule",
    title: "How to read an amortisation schedule (and what it reveals)",
    excerpt:
      "The table your bank buries in a PDF is the most honest document about your loan. Here is what each column means and the three things worth looking for.",
    coverVariant: "emerald",
    tags: "home loan, amortisation, basics",
    keywords:
      "amortisation schedule, amortization schedule explained, loan schedule month wise, how to read loan statement, principal vs interest breakdown",
    seoDescription:
      "What every column in a loan amortisation schedule means, why 81% of your first year goes to interest, and the three things worth checking in the table your lender sends you.",
    content: `Your lender gives you an EMI figure. The amortisation schedule tells you what that EMI is actually doing — and it is usually more surprising than people expect.

## The columns

Each row is one instalment. A complete schedule has six things worth understanding:

**Opening balance** — what you owe at the start of the month. Interest is charged on this figure and nothing else.

**EMI** — your fixed instalment. It does not change (unless you prepay and choose to reduce it), but its composition changes every single month.

**Interest** — the opening balance multiplied by the monthly rate. Your annual rate divided by twelve. At 8.5%, that is 0.7083% a month.

**Principal** — whatever is left of the EMI after interest. This is the only part that actually reduces your debt.

**Prepayment** — any extra you paid that month, applied straight to the balance.

**Closing balance** — opening balance minus principal minus prepayment. It becomes next month's opening balance, which is why the whole thing compounds downward.

## The first thing the table reveals

On a **₹50,00,000 loan at 8.5% over 20 years**, the EMI is ₹43,391. In month one, roughly ₹35,417 of that is interest and only about ₹7,974 touches the principal.

Across the whole first year, **81% of what you pay is interest**.

Principal does not overtake interest within a single instalment until **month 143** — the twelfth year of a twenty-year loan. For more than half the term, you are mostly paying rent on money you already borrowed.

This is not a trick. It is the arithmetic of charging interest on an outstanding balance, and every lender in India works this way. But it explains two things at once: why your balance seems stuck in the early years, and why prepaying early is so disproportionately powerful.

## Three things worth checking

**1. Does the interest column match your rate?**

Take any row. Divide the interest by the opening balance, multiply by 12, multiply by 100. You should get your annual rate. If you do not, something is off — a rate reset you were not told about, a fee bundled into the instalment, or an error. Ask.

**2. What is the balance actually doing?**

Compare the closing balance twelve rows apart. On our example loan, year one reduces the principal by only about ₹1 lakh out of ₹50 lakh. Knowing that in advance stops it from being demoralising, and tells you exactly how much a prepayment is worth.

**3. Where does the crossover fall?**

Find the first row where principal exceeds interest. That is the point the loan tips in your favour. The earlier it falls, the better the shape of your loan — and prepayments pull it forward dramatically.

## Reading it by year instead

Month-by-month is 240 rows, which nobody reads. The year view is more useful: it shows how much principal and interest you paid in each calendar year, which is also what you need at tax time if you are claiming deductions.

Our [calculator](/home-loan-emi-calculator) defaults to the yearly roll-up and expands any year to its months, so you can scan the shape and then drill into the detail. You can export the whole thing to CSV if you would rather work in a spreadsheet.

## What a schedule cannot tell you

It assumes the rate you entered holds for the entire term. On a floating-rate loan it will not — when the benchmark moves, either your EMI or your tenure changes, and the schedule is redrawn. Treat it as an accurate picture of today's terms rather than a prediction.

It also excludes late-payment penalties, bundled insurance, and any charges outside the instalment itself.

## The practical use

Print the schedule at the start of the loan and keep it. When you get a windfall — a bonus, a maturing deposit — look up the outstanding balance for that month, model the prepayment, and you will know within a minute whether it is worth using on the loan. That single habit is worth more than most borrowing advice.

*General information about how loans work, not financial advice. Your lender's own statement is the authoritative record of your loan.*`,
  },
];

async function main() {
  const existing = await all<{ slug: string }>(`SELECT slug FROM posts`);
  const have = new Set(existing.map((p) => p.slug));

  let added = 0;
  for (const g of GUIDES) {
    if (have.has(g.slug)) {
      console.log(`  skip   ${g.slug} (already published)`);
      continue;
    }
    await run(
      `INSERT INTO posts
         (slug, title, excerpt, content, cover_variant, tags, author, status,
          seo_description, keywords, published_at)
       VALUES (?, ?, ?, ?, ?, ?, 'Loan Calculator Pro', 'published', ?, ?, datetime('now'))`,
      [g.slug, g.title, g.excerpt, g.content, g.coverVariant, g.tags, g.seoDescription, g.keywords],
    );
    console.log(`  added  ${g.slug}`);
    added++;
  }

  console.log(`\n  ${added} guide(s) published, ${GUIDES.length - added} already present.`);
  console.log(`  Total posts now: ${have.size + added}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Failed:", err);
    process.exit(1);
  });
