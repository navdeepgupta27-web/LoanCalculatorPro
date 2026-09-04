/**
 * Publishes the investment guides.
 *
 *   npm run db:investment-guides
 *
 * Idempotent: matched on slug, so re-running adds nothing.
 *
 * Every rupee figure was produced by this repository's own engine — run
 * `npm run guide:investment-figures` to reproduce them.
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
    slug: "sip-vs-fd-comparison",
    title: "SIP vs FD: what ₹10,000 a month actually becomes",
    excerpt:
      "Over 15 years the SIP projection shows ₹50.5 lakh and the RD shows ₹31.8 lakh. One of those numbers is a promise and the other is an assumption — and that difference matters more than the gap.",
    coverVariant: "indigo",
    tags: "SIP, fixed deposit, investing basics",
    keywords:
      "SIP vs FD, SIP or FD which is better, fixed deposit vs mutual fund, RD vs SIP comparison, guaranteed vs market returns",
    seoDescription:
      "₹10,000 a month for 15 years: a SIP at an assumed 12% projects ₹50,45,760; an RD at a contractual 7% gives ₹31,76,893, or ₹27,63,825 after tax. What the gap does and does not tell you.",
    content: `This is the most-asked question in Indian personal finance, and it is usually answered badly — by quoting one number and ignoring what kind of number it is.

## The arithmetic

**₹10,000 a month for 15 years.** Both routes receive exactly ₹18,00,000.

| | Recurring deposit | SIP |
| --- | --- | --- |
| Rate | 7% contractual | 12% assumed |
| Maturity value | ₹31,76,893 | ₹50,45,760 |
| XIRR | 7.18% | 12.67% |
| After 30% tax | ₹27,63,825 | see below |

On the face of it the SIP wins by **₹18,68,867**, and by **₹22,81,935** once the deposit's interest is taxed at a 30% slab.

## But those two numbers are not the same kind of number

The RD's 7% is a **contractual obligation**. The bank has agreed to it; barring the bank failing, you will receive ₹31,76,893.

The SIP's 12% is **an assumption you supplied**. Nobody has promised it. It is what the arithmetic produces if markets happen to average 12% across your particular fifteen years — which they may not.

Change only that assumption and watch the argument collapse:

| Actual return | SIP maturity value |
| --- | --- |
| 12% | ₹50,45,760 |
| 8% | ₹34,83,451 |
| **7%** | **₹31,88,112** |
| 6% | ₹29,22,728 |

At 7%, the SIP delivers ₹31,88,112 against the RD's ₹31,76,893 — a difference of about ₹11,000 on ₹18 lakh invested. Essentially identical, except one of them came with fifteen years of market risk and the other did not.

The honest way to state the comparison is this: **the SIP is not offering you more money. It is offering you a distribution of outcomes whose middle is higher and whose bottom is lower.**

## The tax point cuts the other way

Deposit interest is taxed at your slab rate every year. In the 30% bracket a 7% deposit is really **4.90% post-tax** — and we will come back to what that means against inflation in [another guide](/blog/inflation-real-returns-india).

Equity mutual funds are taxed only on redemption, and long-term capital gains above the annual exemption are taxed at a lower rate than slab income. That is a genuine structural advantage of the SIP, and it is separate from the return assumption.

## What actually decides it

Not the maturity figures. These:

**When do you need the money?** If the answer is inside five years, market risk is not a theoretical concern — you can be down 20% on the date you need it, and no amount of long-run averaging helps you. Short horizons favour the guaranteed instrument almost regardless of the numbers above.

**Can you tolerate the fall?** Not "would you accept lower returns" — can you watch a balance drop by a third and keep contributing? Most people believe they can and then sell at the bottom, converting a paper loss into a real one. The behaviour matters more than the product.

**What is the money for?** A house deposit in three years and a retirement in thirty are not the same problem. Emergency money should not be in either — it should be liquid.

**What else do you hold?** This is rarely a binary. Many people hold both, deliberately: the deposit for the near-term and known needs, the SIP for the long-dated ones.

## Run it on your own numbers

Both calculators take the same inputs, and the [comparison tool](/compare-investments) will put them side by side with risk, lock-in and tax treatment shown as columns rather than footnotes — so you can see what the bigger number costs in certainty.

Try changing the assumed return to 7% before you decide. It is the single most clarifying thing you can do with these tools.

*General information about how these products work, not financial advice or a recommendation of either. We are not an investment adviser or distributor. For a decision of any size, speak to a SEBI-registered adviser.*`,
  },

  {
    slug: "absolute-return-cagr-xirr-explained",
    title: "Absolute return, CAGR and XIRR: which number is telling the truth?",
    excerpt:
      "The same investment can honestly be described as returning 533% or 12.67%. Both are correct. Only one is useful for comparing anything.",
    coverVariant: "sky",
    tags: "returns, XIRR, CAGR, investing basics",
    keywords:
      "absolute return vs CAGR, what is XIRR, XIRR vs CAGR, how to calculate returns mutual fund, annualised return meaning",
    seoDescription:
      "A ₹10,000 SIP over 25 years shows a 533% absolute return and a 12.67% XIRR — the same investment. What each measure means, and which one to use when.",
    content: `A fund factsheet says 533%. An app says 12.67%. Your statement says something else again. All three can be describing one investment, correctly.

## Three measures, one SIP

₹10,000 a month at an assumed 12%, held for different lengths of time:

| Period | You invest | Value | Absolute return | XIRR |
| --- | --- | --- | --- | --- |
| 5 years | ₹6,00,000 | ₹8,24,864 | **37%** | 12.67% |
| 15 years | ₹18,00,000 | ₹50,45,760 | **180%** | 12.67% |
| 25 years | ₹30,00,000 | ₹1,89,76,351 | **533%** | 12.67% |

Look at the last two columns. The absolute return climbs from 37% to 533%. The XIRR does not move at all.

That is the whole lesson: **absolute return measures how much, XIRR measures how fast.** The investment did not get better over 25 years — it just had longer to work.

## Absolute return

> (Final value − amount invested) ÷ amount invested

Simple, honest about total gain, and **completely blind to time**. A 100% absolute return earned over three years and one earned over thirty look identical, though the first is excellent and the second is poor.

Use it to answer "how much did I make". Never use it to compare two investments held for different periods — which is precisely how it gets used in marketing.

## CAGR

The compound annual growth rate: the constant yearly rate that would take your starting value to your ending value.

> CAGR = (end ÷ start)<sup>1/years</sup> − 1

CAGR is the right measure for **a single sum invested once and held throughout** — a lumpsum, an FD, a property. It smooths the journey into one number, which is useful and slightly dishonest at the same time: no investment actually grows at a constant rate.

The trap is applying CAGR to a SIP. If you divide a SIP's final value by the total invested and annualise it, you get nonsense — because money you put in last month has not been compounding for fifteen years. It flatters the result badly.

## XIRR

XIRR is CAGR's grown-up sibling: the annualised rate that accounts for **each contribution having been invested for a different length of time**, and for withdrawals along the way.

Mathematically it is the rate at which all your cash flows discount back to zero. There is no closed formula; it has to be solved iteratively, which is why spreadsheets have an \`XIRR\` function rather than a simple expression.

For anything with staggered money — a SIP, an RD, a PPF, a portfolio you have added to and drawn from — **XIRR is the only annualised figure that means anything.**

Our calculators pick between them deliberately: [lumpsum](/lumpsum-calculator) and [FD](/fd-calculator) report a CAGR because the money sits there throughout; [SIP](/sip-calculator), [RD](/rd-calculator) and [PPF](/ppf-calculator) report an XIRR because it does not.

## Why the nominal rate and the XIRR differ slightly

You may notice a SIP at an assumed 12% reports an XIRR of 12.67%. That is not an error.

12% is a **nominal annual rate compounded monthly**. Compounding twelve times a year turns it into an effective annual rate of about 12.68%. The XIRR is measuring the effective rate, which is the one you actually experience.

## How to use this in practice

**Reading a fund's marketing:** if it leads with a large absolute number over a long period, it is telling you the period was long. Find the annualised figure.

**Comparing two options:** only ever compare annualised returns over the same period. Absolute returns across different horizons are meaningless side by side.

**Judging your own portfolio:** XIRR, from your actual contribution dates. Anything else overstates you.

**One thing all three ignore:** inflation, tax and costs. A 12.67% XIRR before a 30% tax and 6% inflation is a very different number afterwards — which is [the subject of another guide](/blog/inflation-real-returns-india).

*General information, not financial advice.*`,
  },

  {
    slug: "step-up-sip-explained",
    title: "The step-up SIP: raise it 10% a year and the corpus doubles",
    excerpt:
      "A flat ₹10,000 SIP over 20 years projects ₹99.9 lakh. Raising it 10% each year projects ₹1.99 crore — but you also put in ₹44 lakh more, and nobody mentions that part.",
    coverVariant: "amber",
    tags: "SIP, step-up SIP, investing basics",
    keywords:
      "step up SIP calculator, top up SIP, increase SIP every year, step up SIP vs normal SIP, annual SIP increase",
    seoDescription:
      "₹10,000 a month over 20 years at 12%: flat gives ₹99,91,479, a 10% annual step-up gives ₹1,98,88,715. The honest breakdown of what causes the difference.",
    content: `A step-up SIP raises your instalment automatically each year, usually in line with your salary. The projections look spectacular. The reason is less magical than it first appears — and worth understanding before you commit.

## The numbers

₹10,000 a month, 20 years, at an assumed 12%:

| Step-up | You invest | Projected value | Extra vs flat |
| --- | --- | --- | --- |
| None | ₹24,00,000 | ₹99,91,479 | — |
| 5% a year | ₹39,67,914 | ₹1,37,37,623 | ₹37,46,144 |
| **10% a year** | **₹68,73,000** | **₹1,98,88,715** | **₹98,97,236** |
| 15% a year | ₹1,22,93,230 | ₹3,02,55,942 | ₹2,02,64,462 |

A 10% step-up almost exactly **doubles** the projected corpus, from ₹99.9 lakh to ₹1.99 crore.

## Now the part the marketing skips

You also invest **₹44,73,000 more**. The flat SIP puts in ₹24 lakh; the 10% step-up puts in ₹68.73 lakh.

That is not a criticism — it is just the arithmetic. Roughly ₹44.7 lakh of extra contributions produced roughly ₹99 lakh of extra corpus, which is a good outcome. But a step-up SIP is not a clever trick that manufactures returns. **It is mostly you investing more money.**

The genuine advantage is behavioural and structural:

- The increase is automatic, so it happens whether or not you remember.
- It rises with your income rather than staying frozen at what you could afford in your twenties.
- Each increase still gets the full remaining term to compound — a rise in year three has seventeen years to work.

## What the instalment actually becomes

Compounding applies to the instalment too, and 10% a year adds up faster than people expect:

| | Monthly instalment |
| --- | --- |
| Year 1 | ₹10,000 |
| Year 10 | ₹23,579 |
| Year 20 | ₹61,159 |

By the final year you are investing more than six times the original amount. Before choosing 15%, look at what that column would say — the last few years of an aggressive step-up can demand more than the plan survives.

## Choosing a rate

**Match it to your expected salary growth, not to the projection.** A step-up you abandon in year six is worse than a smaller one you keep for twenty. The projections above assume every single instalment is paid.

**5% is close to inflation** — it roughly keeps your contribution constant in real terms, which is the minimum for a plan not to quietly shrink.

**10% is realistic for most salaried careers** in the earlier years, and is where the ratio of extra corpus to extra effort still looks attractive.

**15% is aggressive.** It works if your income genuinely compounds that way. It fails badly if it does not, because the largest instalments fall in the years you may have the least flexibility.

You can model any of these — and see the instalment schedule year by year — in the [SIP calculator](/sip-calculator) using the step-up slider.

## One caveat on all of it

Every figure here assumes 12% every year for twenty years. Real markets do not work that way, and a projection is not a forecast. Read [why the annualised number matters more than the total](/blog/absolute-return-cagr-xirr-explained), and try the same calculation at 8% before you plan around the 12% figure.

*General information, not financial advice.*`,
  },

  {
    slug: "inflation-real-returns-india",
    title: "Inflation is the return you never see",
    excerpt:
      "A 7% deposit taxed at 30% earns 4.90%. With inflation at 6%, that is a real return of minus 1.10% — you are paying for the privilege of being safe.",
    coverVariant: "rose",
    tags: "inflation, real returns, investing basics",
    keywords:
      "inflation adjusted returns, real rate of return India, is FD beating inflation, purchasing power calculator, post tax return FD",
    seoDescription:
      "₹1 crore in 20 years buys what ₹31,18,047 buys today. And a 7% FD after 30% tax returns 4.90% against 6% inflation — a real return of −1.10%. The arithmetic nobody puts on the brochure.",
    content: `Every projection on this site — and everywhere else — reports a number in future rupees. Future rupees buy less. That gap is where a great deal of careful financial planning quietly goes wrong.

## What a crore is worth later

At 6% inflation, ₹1,00,00,000 at maturity buys what this much buys today:

| Maturity in | Worth today |
| --- | --- |
| 10 years | ₹55,83,948 |
| 20 years | ₹31,18,047 |
| 30 years | ₹17,41,101 |

Hitting a ₹1 crore target in thirty years delivers, in today's terms, about ₹17.4 lakh of purchasing power. The target was never really a crore.

This is not an argument against saving. It is an argument against picking a round number as a goal without asking what it will buy.

## The uncomfortable bit: safe can mean losing

Take a fixed deposit at 7%. In the 30% tax bracket, interest is taxed every year at your slab, so you keep:

> 7% × (1 − 0.30) = **4.90%**

Against 6% inflation, the real return is:

> 4.90% − 6% = **−1.10% a year**

The balance rises. The purchasing power falls. You are, in a precise and unglamorous sense, paying about 1.1% a year for certainty.

That is a legitimate thing to buy. Certainty has real value — for an emergency fund, for money you need next year, for money you cannot afford to see fall. But it should be a decision, not an accident. Many people hold long-horizon money in deposits believing they are being prudent, and are in fact guaranteeing a slow loss.

## Why tax-free schemes look different

This is where PPF and Sukanya Samriddhi change the arithmetic. Both are EEE — the interest and the maturity amount are tax-free — so the headline rate is the rate you keep. A 7.1% PPF is genuinely 7.1%, not 4.97%, and that is the correct comparison against a taxable 7% deposit.

Whether the 15-year lock-in is acceptable is a separate question. But the post-tax comparison is not close.

## Planning in today's money instead

A more useful way round: decide what you want in **today's** rupees, then inflate it.

Say you want the equivalent of ₹40 lakh in fifteen years. At 12% assumed returns, reaching ₹1 crore in fifteen years needs about **₹19,819 a month** — and that ₹1 crore is worth ₹41,72,651 in today's money. So roughly ₹20,000 a month buys you today's ₹40 lakh, fifteen years out.

Over twenty years, ₹1 crore needs only about **₹10,009 a month** — but it is worth just ₹31,18,047 in today's terms. Same target, longer runway, less purchasing power at the end.

Both calculations are in the [SIP calculator](/sip-calculator), and every calculator on the site has a *"show what it is worth in today's money"* toggle for exactly this reason.

## Three practical conclusions

**Judge returns after tax and after inflation.** A nominal rate on its own tells you very little. The real, post-tax return is the only one that changes what you can buy.

**Match the instrument to the horizon.** Money needed within a few years belongs somewhere safe, and accepting a slightly negative real return on it is a sensible price for certainty. Money needed in twenty years, held in a deposit, is a much harder position to defend.

**Set goals in today's rupees.** "₹40 lakh in today's money" survives contact with reality. "₹1 crore" does not tell you what it buys.

*General information about how inflation and taxation affect returns, not financial advice. Inflation and tax rules both change, and your own tax position may differ. For a decision of any size, speak to a SEBI-registered investment adviser or a qualified chartered accountant.*`,
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

  console.log(`\n  ${added} guide(s) published. Total posts now: ${have.size + added}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Failed:", err);
    process.exit(1);
  });
