export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: number;
  featured?: boolean;
}

export const articles: Article[] = [
  // Investing Basics
  {
    id: "what-is-investing",
    title: "What is Investing? A Beginner's Guide",
    excerpt: "Learn the fundamentals of investing and why it matters for your financial future.",
    content: `Investing is the act of putting your money to work for you. Instead of letting your money sit idle in a checking account, investing allows it to grow over time through various financial instruments.

## Why Invest?

The primary reason to invest is to build wealth over time. While saving money is important, inflation can erode the purchasing power of cash sitting in a bank account. Investing helps your money grow faster than inflation.

## Types of Investments

1. **Stocks** - Ownership shares in a company
2. **Bonds** - Loans to companies or governments
3. **Mutual Funds** - Pooled investments managed by professionals
4. **ETFs** - Exchange-traded funds that track various indexes
5. **Real Estate** - Property investments

## Getting Started

Start small and learn as you go. Many platforms allow you to begin investing with as little as ₪100. The key is to start early and be consistent.`,
    category: "investing-basics",
    readTime: 5,
  },
  {
    id: "compound-interest",
    title: "The Magic of Compound Interest",
    excerpt: "Discover how compound interest can exponentially grow your wealth over time.",
    content: `Compound interest is often called the eighth wonder of the world. It's the process where your money earns interest, and then that interest earns interest too.

## How It Works

If you invest ₪10,000 at 7% annual return:
- Year 1: ₪10,700
- Year 5: ₪14,025
- Year 10: ₪19,672
- Year 20: ₪38,697
- Year 30: ₪76,123

## The Rule of 72

A quick way to estimate how long it takes to double your money: divide 72 by your interest rate. At 7% return, your money doubles approximately every 10.3 years.

## Start Early

The earlier you start, the more time compound interest has to work. Starting at 25 vs 35 can mean hundreds of thousands of shekels difference by retirement.`,
    category: "investing-basics",
    readTime: 4,
  },
  {
    id: "risk-vs-reward",
    title: "Understanding Risk vs Reward",
    excerpt: "Learn how to balance risk and potential returns in your investment strategy.",
    content: `Every investment carries some level of risk. Understanding the relationship between risk and reward is crucial for making informed decisions.

## The Risk-Reward Relationship

Generally, higher potential returns come with higher risks. Conservative investments like government bonds offer stability but lower returns, while stocks can provide higher returns with more volatility.

## Diversification

Don't put all your eggs in one basket. Spreading investments across different asset classes reduces overall risk while maintaining growth potential.

## Your Risk Tolerance

Consider your age, financial goals, and emotional comfort with market fluctuations when determining your risk tolerance.`,
    category: "investing-basics",
    readTime: 6,
  },
  // Emergency Funds
  {
    id: "emergency-fund-basics",
    title: "Building Your Emergency Fund",
    excerpt: "Why you need an emergency fund and how to build one from scratch.",
    content: `An emergency fund is your financial safety net. It's money set aside specifically for unexpected expenses or income loss.

## Why You Need One

Life is unpredictable. Job loss, medical emergencies, car repairs, or home maintenance can happen at any time. Without an emergency fund, you might be forced to take on debt or sell investments at a loss.

## How Much to Save

Most financial experts recommend saving 3-6 months of living expenses. If your job is less stable or you're self-employed, aim for 6-12 months.

## Where to Keep It

Your emergency fund should be easily accessible but separate from your regular checking account. High-yield savings accounts are ideal.

## Building Your Fund

Start with a goal of ₪5,000, then work up to one month of expenses. Automate transfers to make saving effortless.`,
    category: "emergency-funds",
    readTime: 5,
    featured: true,
  },
  {
    id: "emergency-vs-savings",
    title: "Emergency Fund vs Regular Savings",
    excerpt: "Understanding the difference between emergency funds and other savings goals.",
    content: `Not all savings are created equal. Understanding the difference between emergency funds and other savings helps you allocate money properly.

## Emergency Funds

- For unexpected, necessary expenses
- Should be highly liquid
- Not for planned purchases
- Typically 3-6 months of expenses

## Regular Savings

- For planned future expenses
- Can be less liquid
- Vacation funds, down payments, etc.
- Amount varies by goal

## Keep Them Separate

Having separate accounts for different purposes helps you avoid dipping into your emergency fund for non-emergencies.`,
    category: "emergency-funds",
    readTime: 4,
  },
  // Pension & Retirement
  {
    id: "pension-basics-israel",
    title: "Understanding Pensions in Israel",
    excerpt: "A comprehensive guide to the Israeli pension system and your options.",
    content: `Israel's pension system has evolved significantly. Understanding your options is crucial for a secure retirement.

## Types of Pension Plans

1. **Comprehensive Pension Funds** - Provide retirement savings plus insurance
2. **Provident Funds** - Pure savings with more flexibility
3. **Managers' Insurance** - Insurance-based savings plans

## Employer Contributions

By law, employers must contribute to your pension. The current minimum is:
- Employee: 6% of salary
- Employer: 6.5% for savings + additional for disability/survivors

## Tax Benefits

Pension contributions receive tax benefits up to certain limits. Take advantage of these to maximize your savings.`,
    category: "pension-retirement",
    readTime: 7,
  },
  {
    id: "retirement-planning",
    title: "When to Start Planning for Retirement",
    excerpt: "It's never too early to start planning. Learn why starting young matters.",
    content: `The best time to start planning for retirement was yesterday. The second best time is today.

## The Power of Starting Early

Starting at 25 vs 35 can mean retiring with double the savings, even if you contribute the same total amount.

## Setting Retirement Goals

Calculate how much you'll need based on:
- Desired lifestyle in retirement
- Expected pension income
- Healthcare costs
- Inflation

## Action Steps

1. Understand your current pension contributions
2. Calculate your retirement gap
3. Consider additional savings vehicles
4. Review and adjust annually`,
    category: "pension-retirement",
    readTime: 5,
  },
  // Budgeting Tips
  {
    id: "50-30-20-rule",
    title: "The 50/30/20 Budget Rule",
    excerpt: "A simple framework for allocating your income effectively.",
    content: `The 50/30/20 rule is a straightforward budgeting method that helps you balance spending and saving.

## The Breakdown

- **50% Needs**: Rent, utilities, groceries, insurance, minimum debt payments
- **30% Wants**: Entertainment, dining out, hobbies, subscriptions
- **20% Savings**: Emergency fund, investments, extra debt payments

## Adapting to Your Situation

This is a guideline, not a rule. High cost of living areas might require adjusting to 60/20/20. The key is finding a sustainable balance.

## Getting Started

1. Track your spending for a month
2. Categorize expenses as needs, wants, or savings
3. Identify areas to adjust
4. Automate your savings`,
    category: "budgeting-tips",
    readTime: 4,
  },
  {
    id: "tracking-expenses",
    title: "How to Track Your Expenses",
    excerpt: "Practical methods for understanding where your money goes.",
    content: `You can't manage what you don't measure. Tracking expenses is the foundation of good financial health.

## Methods

1. **Apps**: Automatic categorization and insights
2. **Spreadsheets**: Full control and customization
3. **Envelope system**: Physical cash allocation
4. **Bank statements**: Monthly review of transactions

## Key Categories to Track

- Housing
- Transportation
- Food (groceries vs dining out)
- Utilities
- Entertainment
- Subscriptions
- Personal care

## Review Regularly

Set a weekly or monthly date to review your spending. Look for patterns and areas to optimize.`,
    category: "budgeting-tips",
    readTime: 5,
  },
  // Financial Literacy
  {
    id: "financial-hierarchy",
    title: "Understanding the Financial Hierarchy of Needs",
    excerpt: "Just like Maslow's hierarchy, your financial journey follows a logical progression.",
    content: `Just like Maslow's hierarchy, your financial journey follows a logical progression. Learn why building an emergency fund comes before investing, and how to know when you're ready for the next step.

## The Financial Pyramid

**Level 1: Foundation**
- Basic budgeting
- Paying essential bills
- Minimum debt payments

**Level 2: Security**
- Emergency fund (3-6 months)
- Adequate insurance
- Paying off high-interest debt

**Level 3: Growth**
- Retirement contributions
- Investment accounts
- Additional savings goals

**Level 4: Optimization**
- Tax optimization
- Estate planning
- Charitable giving

## Progress at Your Own Pace

Don't rush to higher levels before solidifying your foundation. Each level supports the ones above it.`,
    category: "financial-literacy",
    readTime: 8,
    featured: true,
  },
  {
    id: "financial-terms",
    title: "Essential Financial Terms Everyone Should Know",
    excerpt: "A glossary of important financial concepts explained simply.",
    content: `Financial jargon can be intimidating. Here are the key terms you should understand.

## Investment Terms

- **Asset**: Anything of value you own
- **Liability**: Money you owe
- **Net Worth**: Assets minus liabilities
- **Portfolio**: Collection of investments
- **Diversification**: Spreading risk across investments

## Banking Terms

- **APY**: Annual Percentage Yield
- **Compound Interest**: Interest on interest
- **Principal**: Original amount invested

## Credit Terms

- **Credit Score**: Numerical rating of creditworthiness
- **Interest Rate**: Cost of borrowing money
- **Collateral**: Asset used to secure a loan`,
    category: "financial-literacy",
    readTime: 6,
  },
  // Market Insights
  {
    id: "market-basics",
    title: "How the Stock Market Works",
    excerpt: "Understanding the basics of stock market mechanics.",
    content: `The stock market can seem complex, but the fundamentals are straightforward.

## What is the Stock Market?

A marketplace where shares of publicly traded companies are bought and sold. When you buy a stock, you own a small piece of that company.

## How Prices Move

Stock prices are determined by supply and demand. If more people want to buy than sell, prices rise. If more want to sell, prices fall.

## Key Indexes

- **TA-35**: Top 35 companies on Tel Aviv Stock Exchange
- **S&P 500**: 500 largest US companies
- **NASDAQ**: Technology-focused index

## Long-term Perspective

Daily market movements are mostly noise. Focus on long-term trends and fundamentals rather than short-term volatility.`,
    category: "market-insights",
    readTime: 5,
  },
];

export const categories = [
  { id: "investing-basics", title: "Investing Basics", description: "Learn the fundamentals of investing" },
  { id: "emergency-funds", title: "Emergency Funds", description: "Build your financial safety net" },
  { id: "pension-retirement", title: "Pension & Retirement", description: "Plan for your future" },
  { id: "budgeting-tips", title: "Budgeting Tips", description: "Master your money management" },
  { id: "financial-literacy", title: "Financial Literacy", description: "Understand key financial concepts" },
  { id: "market-insights", title: "Market Insights", description: "Stay informed about markets" },
];

export const getArticlesByCategory = (categoryId: string) => 
  articles.filter(a => a.category === categoryId);

export const getArticleById = (id: string) => 
  articles.find(a => a.id === id);

export const getCategoryById = (id: string) => 
  categories.find(c => c.id === id);
