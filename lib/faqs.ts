import type { LoanTypeId } from "./site";

export interface Faq {
  question: string;
  answer: string;
}

/**
 * FAQ copy lives here so the visible accordion and the FAQPage JSON-LD are
 * generated from one source — Google penalises structured data that does not
 * match the rendered page, which is exactly what happens when the two drift.
 */
export const GENERAL_FAQS: Faq[] = [
  {
    question: "How is EMI calculated?",
    answer:
      "EMI = P × r × (1+r)^n ÷ ((1+r)^n − 1), where P is the principal, r the monthly interest rate (annual rate ÷ 12 ÷ 100) and n the number of monthly instalments. This is the reducing-balance method every Indian lender uses: interest each month is charged only on the balance still outstanding, so the interest portion of your EMI shrinks and the principal portion grows as the loan runs down.",
  },
  {
    question: "Should I reduce my tenure or reduce my EMI when I make a part payment?",
    answer:
      "Reducing the tenure almost always saves more money, because you stop paying interest sooner. Reducing the EMI keeps you paying for the original term and only lowers the monthly outgo. Choose tenure reduction if your cash flow is comfortable and you want the maximum interest saving; choose EMI reduction if your monthly budget is tight and breathing room matters more than the total saved. The calculator shows both outcomes side by side.",
  },
  {
    question: "Does a part payment early in the loan save more than one later?",
    answer:
      "Yes, substantially. Interest is charged on the outstanding balance, so a rupee repaid in year 2 avoids interest for the remaining 18 years, while the same rupee in year 15 avoids only five years of it. On a typical 20-year home loan, a lump sum in year 2 can save several times what the identical amount saves in year 12.",
  },
  {
    question: "Are processing fees and GST included in the calculation?",
    answer:
      "Yes. The calculator applies your processing fee as a percentage of the sanctioned amount, adds GST on that fee (18% is the standard rate on financial services in India), and reports a Total Cost of Loan that includes both. This matters when comparing lenders: a bank offering a rate 0.1% lower but charging double the processing fee can easily be the more expensive option on a short tenure.",
  },
  {
    question: "Can I compare loan offers from different banks?",
    answer:
      "Yes. The comparison tool takes up to four lenders with independent amounts, rates, tenures, processing fees and part-payment plans, then ranks them by total outflow rather than by headline rate — which is the only comparison that reflects fees honestly. You can prefill the rates from our bank interest rates table.",
  },
  {
    question: "Is my data safe? Do you store what I enter?",
    answer:
      "Every calculation runs entirely in your browser. Loan amounts, rates and tenures are never transmitted to our servers or stored anywhere. We record anonymous page-view counts to understand which tools get used, using a random session identifier that is discarded when you close the tab and a one-way hash of your IP address — never the address itself, and never a tracking cookie. Visitors sending a Do Not Track signal are excluded entirely.",
  },
  {
    question: "Are the bank interest rates on this site current?",
    answer:
      "Every rate row carries the date it was recorded and a link to the lender's own published page. Rates in India change frequently — floating rates move with repo-linked benchmarks, and the rate you are actually offered depends on your credit score, income, loan-to-value ratio and existing relationship with the bank. Always confirm on the lender's website or in writing before acting on any figure.",
  },
  {
    question: "Is this financial advice?",
    answer:
      "No. Loan Calculator Pro is a calculation tool, not a lender, broker or financial adviser. It shows you the arithmetic of a loan on the numbers you enter. Whether a particular loan suits your circumstances is a decision for you, and if the amount is significant it is worth discussing with a qualified adviser. Your lender's sanction letter is the only authoritative statement of your EMI, interest and charges.",
  },
];

/** Extra, product-specific questions appended on each calculator landing page. */
export const LOAN_TYPE_FAQS: Record<LoanTypeId, Faq[]> = {
  home: [
    {
      question: "How much of my home loan EMI is interest in the early years?",
      answer:
        "On a ₹50 lakh 20-year home loan at 8.5%, about 81% of your first year's instalments go to interest and only 19% reduces the principal. The crossover — where principal overtakes interest within a single EMI — does not arrive until month 143, in the twelfth year. This is precisely why prepaying early has such a large effect: the same ₹5 lakh saves roughly ₹14.6 lakh in interest if paid in month 24, but only about ₹4.2 lakh if paid in month 144. The year-by-year chart on this page shows the split for your own numbers.",
    },
    {
      question: "Can I claim tax deductions on a home loan?",
      answer:
        "Under the old tax regime, Section 24(b) allows a deduction on interest paid for a self-occupied property, and Section 80C covers principal repayment within the overall 80C limit. The new regime largely removes these benefits for self-occupied property. Limits and eligibility change with each Finance Act, so check the current year's rules or ask a tax professional — this calculator does not model tax relief.",
    },
    {
      question: "Should I prepay my home loan or invest the money instead?",
      answer:
        "The arithmetic comparison is your loan's interest rate against the return you would earn elsewhere, after tax and adjusted for risk. Prepaying gives a guaranteed, risk-free return equal to your loan rate; an investment offering more comes with the risk of delivering less. The right answer depends on your rate, tax position, job security and how you feel about carrying debt. This tool quantifies the loan side precisely; it cannot tell you what to do.",
    },
  ],
  car: [
    {
      question: "Why is my car loan rate higher than a home loan rate?",
      answer:
        "A car is a depreciating asset, so the lender's security loses value from the day you drive it away, while property generally does not. That extra risk shows up as a higher rate and a shorter maximum tenure — typically up to seven years for a new car and less for a used one.",
    },
    {
      question: "Is a longer car loan tenure a bad idea?",
      answer:
        "Stretching a car loan lowers the EMI but raises total interest, and it increases the risk of negative equity — owing more than the car is worth, which becomes a problem if you sell or write it off early. Run both tenures in the calculator and compare the Total Cost of Loan figure before choosing the longer term.",
    },
  ],
  personal: [
    {
      question: "Why do personal loan rates vary so much between lenders?",
      answer:
        "Personal loans are unsecured — there is no asset backing them — so pricing is driven almost entirely by the lender's assessment of you: credit score, income stability, employer category and existing obligations. This is why the same borrower can see offers spanning a very wide band, and why comparing the total cost across several lenders is worth the effort.",
    },
    {
      question: "What are foreclosure and part-payment charges on a personal loan?",
      answer:
        "Many lenders levy a fee on early closure of a fixed-rate personal loan, and some impose a lock-in period before any prepayment is allowed. These charges are not modelled by this calculator — check your loan agreement, then compare the fee against the interest saving the calculator shows to decide whether prepaying is worthwhile.",
    },
  ],
  business: [
    {
      question: "What is the difference between a term loan and working capital?",
      answer:
        "A term loan is a fixed amount repaid on a schedule of EMIs — that is what this calculator models. Working capital facilities such as cash credit or overdraft charge interest only on the amount actually drawn, with no fixed repayment schedule, so an EMI calculation does not apply to them.",
    },
  ],
  education: [
    {
      question: "How does the moratorium period on an education loan work?",
      answer:
        "Most education loans allow a moratorium covering the course duration plus six to twelve months, during which you make no EMI payments. Interest usually still accrues and is added to the principal, so the balance you begin repaying is larger than the amount disbursed. This calculator models the repayment phase — enter the post-moratorium balance as the loan amount for an accurate EMI.",
    },
  ],
  gold: [
    {
      question: "How is a gold loan different from other loans?",
      answer:
        "A gold loan is secured against pledged jewellery, so approval is fast and credit history matters far less. Tenures are short — often 6 to 24 months — and some schemes are bullet-repayment (all interest and principal at the end) rather than EMI-based. Use this calculator for EMI-based gold loan schemes.",
    },
  ],
};

export function faqsFor(loanType: LoanTypeId): Faq[] {
  return [...LOAN_TYPE_FAQS[loanType], ...GENERAL_FAQS.slice(0, 5)];
}
