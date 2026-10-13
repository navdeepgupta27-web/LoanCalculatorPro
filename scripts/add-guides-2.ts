/**
 * Publishes the second batch of guides.
 *
 *   npm run db:guides-2
 *
 * Idempotent: matched on slug, so re-running adds nothing.
 *
 * Every rupee figure was produced by this repository's own engine — run
 * `npm run guide:figures-2` to reproduce them. Nothing here is estimated or
 * remembered, and no statutory rate or tax threshold is quoted as a number,
 * because those change and belong in the database with a source behind them.
 */
import { all, run } from "../lib/db";
import { AUTHOR } from "../lib/site";

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
    slug: "prepay-home-loan-or-invest-surplus",
    title: "Prepay the loan or invest the surplus? Run both numbers",
    excerpt:
      "₹10,000 a month into the loan saves a guaranteed ₹21.79 lakh. The same amount invested projects a gain of ₹75.91 lakh. The gap looks decisive until you notice only one of those numbers is a promise.",
    coverVariant: "emerald",
    tags: "prepayment, investing, home loan",
    keywords:
      "prepay home loan or invest, should I prepay my home loan, home loan prepayment vs SIP, is prepaying a loan worth it, loan prepayment calculator",
    seoDescription:
      "On a ₹50 lakh loan at 8.5%, an extra ₹10,000 a month saves ₹21,78,721 in interest and clears it 7 years 1 month early. The same ₹10,000 invested at an assumed 12% projects ₹99,91,479. Why the comparison is not as lopsided as it looks.",
    content: `Every borrower with spare cash reaches this question, and most answers to it are a slogan. "Debt is bad, clear it first." "Nobody got rich paying off a home loan." Both ignore that the right answer depends entirely on numbers you can actually compute.

So let us compute them.

## The setup

**A ₹50,00,000 home loan at 8.5% over 20 years.** The EMI is **₹43,391**, and left alone the loan costs **₹54,13,879** in interest — more than the amount borrowed.

Now suppose you have an extra **₹10,000 a month**. Two options.

## Option one: put it into the loan

| | |
| --- | --- |
| Interest, no extra payment | ₹54,13,879 |
| Interest, paying ₹10,000 extra monthly | ₹32,35,158 |
| **Interest saved** | **₹21,78,721** |
| Loan cleared | **7 years 1 month early** |
| Instalments actually paid | 155 instead of 240 |

You stop paying in month 155. Eighty-five instalments never happen.

## Option two: invest it instead

The same ₹10,000 a month for the full twenty years, at an assumed 12%:

| | |
| --- | --- |
| Total invested | ₹24,00,000 |
| Projected value | ₹99,91,479 |
| **Projected gain** | **₹75,91,479** |

₹75.91 lakh against ₹21.79 lakh. Investing wins by more than three times.

## Why that is not the end of the argument

Read the two numbers again and notice they are not the same kind of number.

The **₹21,78,721** is arithmetic on a contract. Your rate is in your loan agreement. Pay the extra and that interest does not accrue. There is no scenario in which the saving fails to materialise, short of the lender refusing a prepayment — which, on a floating-rate home loan, they cannot do without charge in most cases.

The **₹75,91,479** is arithmetic on an assumption you supplied. Nobody has promised 12%. It is what the formula produces if your particular twenty years average 12%, which some twenty-year periods do and others do not. The projection also ignores expense ratios, exit loads and tax on the gains.

A guaranteed 8.5% and an assumed 12% are not three-and-a-half points apart in any meaningful sense. One is a floor, the other is a midpoint of a wide distribution.

## The questions that actually decide it

**Is your loan rate above or below what you would realistically earn?** This is the arithmetic core. At 8.5% against an assumed 12%, investing has the edge on paper. At 11% against the same assumption, the edge narrows to almost nothing — and a personal loan at 14% is being cleared, not competed with.

**How much does the certainty matter to you?** Prepaying converts an uncertain future gain into a certain present reduction. People who dislike that trade have usually never had a job scare while carrying a mortgage.

**What happens to your ability to invest later?** Clearing the loan in year 13 frees up ₹43,391 a month for the remaining seven years — a far larger sum than the ₹10,000 you were putting in. Model that, because the simple comparison above misses it entirely.

**Would you actually invest it?** This is the one nobody admits. Money assigned to the loan leaves your account automatically. Money assigned to investing competes with everything else you might buy. A prepayment plan you follow beats an investment plan you abandon in year three.

## What the timing does

One more thing the headline figures hide: *when* you prepay changes the result enormously, because early instalments are almost entirely interest. The same lump sum applied in year two is worth roughly three and a half times what it is worth in year twelve.

If you are going to prepay, early is the whole game. If you are five years from the end of a twenty-year loan, there is very little interest left to save and the argument swings decisively toward investing.

## There is no universal answer

Anyone who tells you otherwise is selling something. What there is, is a calculation you can do in two minutes with your own rate, your own term and your own honest estimate of what you would earn.

Run the loan with a recurring part-payment on the [home loan calculator](/in/home-loan-emi-calculator), then run the same monthly amount through the [SIP calculator](/in/sip-calculator). Put the guaranteed saving next to the projected gain and decide with both in front of you.`,
  },

  {
    slug: "what-your-credit-score-is-worth-in-rupees",
    title: "What your credit score is worth, in rupees",
    excerpt:
      "The gap between the best rate band and a middling one is 1.3 percentage points. On a ₹50 lakh loan that is ₹10.08 lakh — about the price of a car, for a number most people never check.",
    coverVariant: "violet",
    tags: "credit score, home loan, interest rates",
    keywords:
      "credit score home loan interest rate, CIBIL score effect on loan, how credit score affects EMI, improve credit score before home loan, credit score interest rate difference",
    seoDescription:
      "On a ₹50 lakh home loan over 20 years, moving from 8.50% to 9.80% raises the EMI by ₹4,199 and the total interest by ₹10,07,821. What a credit score is actually worth, computed.",
    content: `Lenders publish a rate "starting from" some figure. Almost nobody gets the starting figure. What you are offered is set by your file, and the single largest input is your credit score.

Here is what the difference costs, on a **₹50,00,000 loan over 20 years**.

| Rate | EMI | Total interest | Extra vs the best band |
| --- | --- | --- | --- |
| 8.50% | ₹43,391 | ₹54,13,879 | — |
| 8.75% | ₹44,186 | ₹56,04,529 | ₹1,90,650 |
| 9.25% | ₹45,793 | ₹59,90,402 | ₹5,76,523 |
| 9.80% | ₹47,590 | ₹64,21,700 | ₹10,07,821 |

The EMI difference between the top and bottom rows is **₹4,199 a month** — noticeable, but survivable. The total difference is **₹10,07,821**, which is a different conversation entirely.

## Why the monthly figure misleads

₹4,199 sounds manageable. That is exactly the problem: it sounds manageable for 240 consecutive months, and nobody multiplies. The monthly framing is how a rate difference becomes invisible.

Look at the lakh column instead. It is the number you are actually agreeing to.

## What moves the score

Credit scoring is not mysterious, but it is slow. The inputs that matter most:

**Payment history.** Missing instalments, on anything, hurts more than any other single factor and stays visible for years. One missed credit card payment is worth more damage than most people expect.

**Credit utilisation.** How much of your available limit you habitually use. Someone consistently spending near their card limit looks stretched even if they always pay in full. The commonly cited comfortable ceiling is well under half the limit.

**Length of history.** An older account is worth something. Closing your oldest card to "tidy up" removes history and can lower the score.

**Mix and recent enquiries.** A spread of credit types reads better than one. A flurry of loan applications in a short window reads as distress — which matters if you are shopping for a mortgage and letting four banks run a hard enquiry in the same fortnight.

## The practical consequence

If you are a year out from applying for a large loan, that year is worth more than most negotiation. Clearing a card balance down, not opening anything new, and not missing a single payment is worth real money — on the figures above, potentially ₹10 lakh of it.

If you are a month out, the score is largely what it is. What you can still do is shop properly: get written offers from several lenders rather than accepting the first, because the same file is priced differently by different banks.

## And check it before they do

You can see your own score without it counting as a hard enquiry. Do that before you apply, not after a bank has already priced you. If there is an error on the report — someone else's default, a closed loan showing as open — it takes time to correct, and the time has to come before the application.

See where published rates actually start on the [home loan rates page](/in/bank-interest-rates/home-loan), then put your likely rate into the [home loan calculator](/in/home-loan-emi-calculator) alongside the best advertised one. The gap between those two runs is what your score is worth.`,
  },

  {
    slug: "how-much-home-loan-can-i-afford",
    title: "How much home loan can you actually afford?",
    excerpt:
      "A lender will usually let instalments take 40 to 50% of your income. On ₹1.25 lakh a month that is the difference between a ₹57.6 lakh loan and a ₹72 lakh one — and the second is not obviously better.",
    coverVariant: "sky",
    tags: "home loan, eligibility, affordability",
    keywords:
      "how much home loan can I get, home loan eligibility calculator, FOIR home loan, home loan based on salary, loan eligibility by income",
    seoDescription:
      "At 8.5% over 20 years, an income of ₹1,25,000 a month supports roughly ₹57,61,542 at 40% FOIR and ₹72,01,927 at 50%. How lenders decide, and why the larger number is not the target.",
    content: `There are two different questions here and they get confused constantly. *How much will a bank lend me* is an underwriting question. *How much should I borrow* is a budgeting question. The first has a formula. The second does not, and the formula is a poor substitute for it.

## How the lender decides

The main lever is **FOIR** — the share of your monthly income that all your loan instalments combined are allowed to consume. Most lenders work somewhere between 40% and 50%, with the higher end available to higher earners, because someone on ₹3 lakh a month can give up half of it and still eat.

Run that backwards through the EMI formula and you get the loan it supports. At **8.5% over 20 years**:

| Monthly income | At 40% FOIR | At 50% FOIR |
| --- | --- | --- |
| ₹75,000 | EMI ₹30,000 → about ₹34,56,925 | EMI ₹37,500 → about ₹43,21,156 |
| ₹1,25,000 | EMI ₹50,000 → about ₹57,61,542 | EMI ₹62,500 → about ₹72,01,927 |
| ₹2,00,000 | EMI ₹80,000 → about ₹92,18,467 | EMI ₹1,00,000 → about ₹1,15,23,084 |

Two things follow immediately. The jump from 40% to 50% is worth roughly **25% more loan** — which is why the FOIR a lender grants you matters nearly as much as the rate. And existing obligations come off the top: a ₹15,000 car loan instalment reduces what is available for a mortgage by exactly ₹15,000, so clearing small loans before applying raises the ceiling.

## Why the ceiling is not the target

The formula says nothing about the rest of your life. A 50% FOIR leaves half your income for everything — food, school fees, insurance, travel, the boiler that fails, the job that ends. Lenders are underwriting the probability you default, not the quality of your next twenty years.

Three things the formula ignores:

**The loan is not the cost of the house.** Stamp duty and registration, legal fees, brokerage, the deposit itself, and then the furnishing and repairs that always follow. These are substantial and they land in the same months as your first instalments.

**Your rate can rise.** On a floating-rate loan, a benchmark increase raises your instalment. Someone at 50% FOIR has very little room for that; someone at 35% barely notices. Stress-test your own figure a point or two higher before committing.

**Income is less stable than a payslip suggests.** The formula treats this month's salary as a twenty-year certainty. It usually is not, particularly if a chunk of it is variable pay.

## A more useful question

Rather than "what is my maximum", try: *what instalment could I pay for twenty years without resenting it, including in a bad year?*

That number is almost always lower than the ceiling, and the gap is the margin you will be grateful for. A smaller loan on a shorter term also costs dramatically less in total interest, which the maximum-eligibility framing never shows you.

## Then check the total, not the monthly

The affordability calculation stops at the instalment. The thing worth seeing before you sign is total cost — on a twenty-year loan, interest commonly exceeds the amount borrowed.

Put the figure you are comfortable with into the [home loan calculator](/in/home-loan-emi-calculator) and look at total interest rather than EMI. Then try the same loan over fifteen years instead of twenty and compare. The instalment rises; the total falls, often by a great deal.`,
  },

  {
    slug: "floating-rate-and-the-repo-rate",
    title: "What a repo rate change actually does to your EMI",
    excerpt:
      "A quarter-point rise three years into a ₹50 lakh loan adds ₹710 a month. Small — until you notice the lender may not change your instalment at all, and extends the loan instead.",
    coverVariant: "amber",
    tags: "floating rate, repo rate, home loan",
    keywords:
      "repo rate home loan EMI, floating vs fixed home loan, what happens when repo rate increases, repo linked lending rate, home loan rate reset",
    seoDescription:
      "Three years into a ₹50 lakh loan at 8.5%, a 0.25% rise lifts the EMI from ₹43,391 to ₹44,102 and a 0.50% rise to ₹44,817. What floating actually means, and why the tenure often moves instead.",
    content: `Most Indian home loans are floating, which means the rate is not yours to keep. It is tied to an external benchmark — commonly the central bank's repo rate — with a spread the lender adds on top and does not change. When the benchmark moves, your rate follows.

What people underestimate is how the change reaches them.

## The arithmetic of a rise

Take a **₹50,00,000 loan at 8.5% over 20 years**, EMI **₹43,391**. Three years in, the outstanding balance is **₹46,74,300** — note how little of the principal twelve instalments a year have actually cleared, which is the reducing-balance method working as designed.

Now the benchmark rises:

| Change | New EMI | Monthly difference |
| --- | --- | --- |
| +0.25% | ₹44,102 | ₹710 |
| +0.50% | ₹44,817 | ₹1,426 |

If the lender adjusts the instalment, that is what you feel. Modest, and most people absorb it.

## But the instalment often does not change

Here is the part that matters. Faced with a rate rise, a lender has two options: raise your instalment, or keep the instalment and extend the term. Many default to extending, because it requires no conversation with you.

That feels painless and is not. The instalment you are paying stays the same, so nothing appears on your bank statement to notice — but you are now paying it for longer, and every one of those extra months is almost entirely interest. A rise absorbed by tenure costs more in total than the same rise absorbed by instalment, and it arrives invisibly.

**This is worth a phone call.** Ask your lender, in writing, which they did at your last reset. If they extended the term and you can afford the higher instalment, ask them to switch — you will pay the same each month as a higher-EMI borrower and finish at the original date.

## When the change actually applies

Not immediately. Floating loans have **reset dates** — monthly, quarterly, or at some other interval written into your agreement. A benchmark change takes effect at your next reset, which is why your neighbour's rate may move before yours even at the same bank.

Falls work the same way, which cuts the other direction: a rate cut does not reach you the day it is announced either.

## Fixed instead?

A fixed rate does not move. It also starts higher, which is the lender charging you for taking the interest-rate risk off your hands, and it usually carries prepayment restrictions that floating loans in India do not.

Some lenders offer hybrids — fixed for an initial period, floating after. Those are worth reading closely, because what happens at the switchover is where the terms live.

The honest position is that nobody knows where rates go over twenty years, and anyone certain enough to tell you is guessing. What you can do is decide which risk you would rather hold, and price it: compare the fixed offer against the floating one at today's rate, then against the floating one a point or two higher, and see what the insurance actually costs.

## What to check on your own loan

Three things, all in your agreement or one call away: the **benchmark** your rate is tied to, your **spread** over it, and your **reset frequency**. Borrowers who know all three can tell when something has changed. Borrowers who do not find out years later that their twenty-year loan became a twenty-four-year loan.

Model a rise on your own balance with the [home loan calculator](/in/home-loan-emi-calculator) — enter the outstanding amount and the remaining term rather than the original figures, and compare the instalment at today's rate against one a point higher.`,
  },

  {
    slug: "processing-fee-gst-and-the-real-cost",
    title: "The fee that does not show in the interest rate",
    excerpt:
      "Over twenty years a 0.10% better rate beats a fee three-quarters of a percent higher. Over three years the same comparison flips. The term decides which number matters.",
    coverVariant: "rose",
    tags: "processing fee, total cost, comparing lenders",
    keywords:
      "home loan processing fee, loan processing fee and GST, total cost of loan, hidden charges home loan, compare loan offers total cost",
    seoDescription:
      "8.40% with a 1% fee costs ₹1,03,97,054 over twenty years against ₹1,04,28,629 for 8.50% with a 0.25% fee — the lower rate wins. On a three-year personal loan the result reverses. Worked both ways.",
    content: `Lenders compete on the rate because the rate is what borrowers compare. The fees are where the difference between offers often actually sits, and they behave differently from interest in a way that changes which offer is cheaper.

## What gets added

**Processing fee**, usually a percentage of the sanctioned amount, sometimes with a floor and a cap. **Tax on that fee** — in India, GST, which is charged on the fee and not on the loan. Then, depending on the lender: legal and technical valuation charges, documentation charges, and on some products an administrative fee at disbursal.

The important structural point: interest accrues over the life of the loan, while the fee is paid once, up front, on day one. That difference is what makes the comparison tenure-dependent.

## Twenty years: the rate wins

**₹50,00,000 over 20 years.** Two offers:

| | Offer A | Offer B |
| --- | --- | --- |
| Rate | 8.40% | 8.50% |
| Processing fee | 1.00% | 0.25% |
| Fees including GST | ₹59,000 | ₹14,750 |
| **Total cost** | **₹1,03,97,054** | **₹1,04,28,629** |

Offer A charges four times the fee and is still cheaper, by **₹31,575**. Over two hundred and forty instalments, a tenth of a percentage point of interest outweighs ₹44,250 of extra fee comfortably.

## Three years: the fee wins

Same comparison, different shape. **₹5,00,000 personal loan over 3 years:**

| | Offer A | Offer B |
| --- | --- | --- |
| Rate | 11.0% | 11.5% |
| Processing fee | 2.00% | 0.50% |
| **Total cost** | **₹6,01,097** | **₹5,96,518** |

Now the higher-rate offer is cheaper, by **₹4,579**. Half a percentage point over thirty-six instalments is less than the fee difference, so the cheaper fee wins.

Note that this flip happened with a *larger* rate gap than the twenty-year example. The term is doing the work, not the size of the spread.

## The rule that falls out of this

**The longer the loan, the more the rate matters and the less the fee does.** On a twenty-year mortgage, chase the rate. On a three-year personal loan or a two-year gold loan, the fee is frequently the deciding number — and it is the one lenders advertise least prominently.

Which is why "lowest interest rate" is a bad shortcut on short-tenure borrowing, and why a comparison that stops at the rate is not a comparison.

## What else to ask about

Fees are not the only thing outside the rate:

**Prepayment and foreclosure charges.** Floating-rate home loans to individuals generally cannot carry a prepayment penalty in India, but fixed-rate loans and most personal loans can. If there is any chance you will clear it early, this clause is worth more than a small rate difference.

**Insurance bundled into the loan.** Sometimes offered, occasionally pushed. It is a separate product with its own cost; added to the principal, you pay interest on it for the full term.

**What the fee is a percentage of.** The sanctioned amount or the disbursed amount, and whether a floor applies. On smaller loans a minimum fee can work out far above the advertised percentage.

## How to compare properly

Get every offer in writing with the rate, the fee, the tax on the fee, and any other charge named. Then compute total money leaving your account over the term you actually expect to hold the loan — not the term on the sanction letter, if you plan to clear it early.

The [comparison tool](/in/compare-loans) takes up to four offers with their own rates, fees and prepayment plans, and ranks them on total outflow rather than headline rate. That ranking is the one that answers the question.`,
  },

  {
    slug: "emergency-fund-before-investing",
    title: "The emergency fund costs you ₹2 lakh. Keep it anyway",
    excerpt:
      "Six months of expenses parked in savings instead of invested gives up about ₹2.07 lakh over five years. That is the premium, and it buys the one thing a portfolio cannot.",
    coverVariant: "indigo",
    tags: "emergency fund, investing basics, financial planning",
    keywords:
      "emergency fund India, how much emergency fund, emergency fund vs investing, where to keep emergency fund, contingency fund calculation",
    seoDescription:
      "Six months of ₹60,000 expenses is ₹3,60,000. Left in a 3.5% savings account it becomes ₹4,27,567 over five years; at an assumed 12% it would have been ₹6,34,443. The ₹2,06,876 gap is what the safety costs.",
    content: `An emergency fund is the least interesting thing in personal finance and the first thing that should exist. It earns little, it does nothing exciting, and the arithmetic says plainly that it is costing you money. That arithmetic is also missing the point — but it is worth seeing properly rather than hand-waving past it.

## What it costs

Suppose your household spends **₹60,000 a month**.

| Cover | Fund needed |
| --- | --- |
| 3 months | ₹1,80,000 |
| 6 months | ₹3,60,000 |

Take the six-month figure and leave it in a savings account at 3.5% for five years. Then imagine the same amount invested at an assumed 12% instead:

| | After 5 years |
| --- | --- |
| In a 3.5% savings account | ₹4,27,567 |
| At an assumed 12% | ₹6,34,443 |
| **Difference** | **₹2,06,876** |

So the fund costs roughly **₹2.07 lakh over five years** in gains you chose not to pursue. That is a real number and worth naming rather than pretending the trade does not exist.

## What it buys

The thing it buys is not a return. It is that a bad month does not become a bad decade.

Without a fund, an unexpected ₹2 lakh expense has to come from somewhere, and the options are all worse than cash:

**Selling investments at the wrong time.** Emergencies are uncorrelated with market highs. Quite often they arrive during the same downturn that caused the job loss, so you sell at the bottom — turning a paper loss into a permanent one, and giving up the recovery as well.

**Borrowing at a bad rate.** A personal loan at 11% to 17%, or worse, a credit card at considerably more. Interest on that debt will exceed any plausible return on the investments you protected by not selling.

**Breaking a locked product early.** A fixed deposit closed before maturity typically pays a lower rate and a penalty. A PPF or EPF withdrawal, where permitted at all, may carry tax consequences and removes compounding you cannot buy back.

Each of those costs more than ₹2.07 lakh over five years with surprising ease. The fund is not an investment with a poor return; it is insurance with an explicit premium.

## How much, honestly

The usual advice is three to six months of expenses. The spread matters more than the number:

**Toward three months** if your income is stable and salaried, you have no dependants relying solely on you, you are covered by employer health insurance, and another earner shares the household.

**Toward six, or beyond** if your income is variable, commission-based or self-employed; if you are the only earner; if you support parents or children; or if you work somewhere layoffs are a live possibility.

And count *expenses*, not income. What the household actually must spend to keep running — rent or instalments, food, utilities, school fees, insurance premiums, medicines. Not holidays.

## Where to keep it

The test is not return. It is whether you can have the money within a day or two without a penalty or a loss.

That means it does not belong in equity, where the value on the day you need it is unknowable, and it does not belong in anything with a lock-in. A savings account is the simplest answer. A liquid or overnight fund is marginally better on return with a short settlement. Splitting it — a month in the bank, the rest a redemption away — is a reasonable middle.

What matters more than squeezing the return is that it stays separate from your spending account, so it does not quietly get absorbed.

## Then get on with it

Once the fund exists, it mostly sits there. Top it up when expenses rise, replace it after you use it, and stop thinking about it. The point of the exercise is that it makes everything after it possible: you can invest with a long horizon precisely because a short-term shock no longer forces you to sell.

If you want to see the cost of the trade on your own numbers, put your fund amount into the [lumpsum calculator](/in/lumpsum-calculator) at a savings rate and then at an equity assumption. The gap is your premium. Most people, having seen it, keep paying it.`,
  },
];

async function main() {
  const existing = new Set(
    (await all<{ slug: string }>(`SELECT slug FROM posts`)).map((p) => p.slug),
  );

  let added = 0;
  for (const g of GUIDES) {
    if (existing.has(g.slug)) {
      console.log(`  skip   ${g.slug} (already published)`);
      continue;
    }
    await run(
      `INSERT INTO posts
         (slug, title, excerpt, content, cover_variant, tags, author, status,
          seo_description, keywords, country, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, 'in', datetime('now'))`,
      [
        g.slug,
        g.title,
        g.excerpt,
        g.content,
        g.coverVariant,
        g.tags,
        AUTHOR.name,
        g.seoDescription,
        g.keywords,
      ],
    );
    console.log(`  added  ${g.slug}`);
    added++;
  }

  const total = await all<{ n: number }>(
    `SELECT COUNT(*) AS n FROM posts WHERE status = 'published'`,
  );
  console.log(`\n${added} added. ${total[0]?.n ?? 0} guides published.\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
