import React from "react";

const GBP_IMAGE_BASE = "/green%20buisness%20plan";

const INTRO_POINTS = [
  "If you have developed your Green Business Model (GBM) within the platform, review and validate it first (Step 1).",
  "If you start your journey in the platform by developing your GBP, go directly to Step 2: \"Launching your business\" (we recommend starting from the GBM development tool)."
];

const PROCUREMENT_CRITERIA = [
  "Choose local suppliers when possible.",
  "Choose suppliers who have clear and transparent sustainability initiatives to reduce waste, conserve natural resources, and minimize greenhouse gas emissions.",
  "Choose suppliers who offer organic and fair-trade certified products wherever possible.",
  "Choose suppliers who offer environmentally sound products (for example, a printer that uses 100% post-consumer paper to print your marketing materials)."
];

const DISTRIBUTION_FACTORS = [
  "The number of customer segments or the size of the market you are targeting.",
  "Investment required by the distribution channel.",
  "Whether the product is standard (the same version appeals across profiles) or non-standardized (needs tailoring and direct contact).",
  "Amount of control required over the distribution channel.",
  "Time needed to build and sustain healthy relationships with distributors."
];

const FINANCIAL_ITEMS = [
  "Setup costs and source of capital.",
  "Income statement (profit and loss account) for Year 0 of operations.",
  "Cash flow forecast.",
  "Balance sheet forecast.",
  "Break-even point calculation.",
  "Income statement projection for Years 1, 2, and 3.",
  "Other financial metrics."
];

const FUNDING_SOURCES = [
  {
    title: "Bootstrapping",
    text:
      "Self-funding from your savings (if you have it) is always preferred. Advantages: no time going hat-in-hand to investors and you do not have to relinquish control of your company."
  },
  {
    title: "The three Fs",
    text:
      "Friends, Family, and Fools. Tap your inner circle before expanding your horizons. Professional investors like to see real skin in the game - your own, or that of people who trust you."
  },
  {
    title: "Bartering",
    text:
      "Exchanging goods or services as a substitute for cash can be a great way to run on a small wallet. Example: trading free office space by agreeing to be the property manager for the owner."
  },
  {
    title: "Crowdfunding",
    text:
      "An alternative form of finance that raises monetary contributions from a large number of people, often via online platforms."
  },
  {
    title: "Incubators",
    text:
      "Organizations that provide resources - laboratories, office space, consulting, cash, marketing - in exchange for equity in young companies when they are most vulnerable."
  },
  {
    title: "Commit to a major customer",
    text:
      "Some customers may cover your development costs in exchange for early access and influence over production requirements."
  },
  {
    title: "Small business grants",
    text:
      "Government or institutional grants can be a major focus for green projects. They can be time-consuming to secure but usually do not demand equity."
  },
  {
    title: "Loans and lines of credit",
    text:
      "If you need a temporary or small infusion of cash, consider bank lines of credit or microcredit. Microloans can be helpful when collateral is limited."
  },
  {
    title: "Angel investors",
    text:
      "Angel networks are useful for early investments (often EUR 25,000 to EUR 250,000). Networking is critical, and you need angels who understand your industry."
  },
  {
    title: "Venture capital",
    text:
      "Best suited for later stages and larger needs. VCs take equity and control, and deals can take months to close."
  }
];

const MATURITY_OPTIONS = [
  "0-6 months (Start-up)",
  "6 months - 3 years (Acceleration)",
  "3+ years (Scaling up)"
];

const ORG_OVERVIEW_FIELDS = [
  { id: "gbp_org_name", label: "Organization name", type: "text" },
  { id: "gbp_org_contact", label: "Contact person", type: "text" },
  { id: "gbp_org_email", label: "Email", type: "email" },
  { id: "gbp_org_address", label: "Address", type: "text" },
  { id: "gbp_org_phone", label: "Phone", type: "tel" },
  { id: "gbp_org_website", label: "Website", type: "url" },
  { id: "gbp_org_employees", label: "Number of employees", type: "text" },
  { id: "gbp_org_maturity", label: "Level of maturity", type: "select", options: MATURITY_OPTIONS },
  { id: "gbp_org_legal_status", label: "Legal status", type: "text" },
  { id: "gbp_org_sector", label: "Sector", type: "text" },
  { id: "gbp_org_country", label: "Country", type: "text" },
  { id: "gbp_org_team", label: "Team / manager members", type: "textarea", rows: 3 }
];

const BUSINESS_OVERVIEW_FIELDS = [
  { id: "gbp_business_problem_needs", label: "Problem / needs", type: "textarea", rows: 3 },
  { id: "gbp_business_best_solution", label: "Best solution", type: "textarea", rows: 3 },
  { id: "gbp_business_offer", label: "Product and service offer", type: "textarea", rows: 3 },
  { id: "gbp_business_target_market", label: "Target market and customers (current and future)", type: "textarea", rows: 3 },
  { id: "gbp_business_competitive_edge", label: "Better than competitors", type: "textarea", rows: 3 }
];

const FINANCIAL_INFO_FIELDS = [
  { id: "gbp_financial_summary", label: "Financial summary", type: "textarea", rows: 3 },
  { id: "gbp_financial_capital_raised", label: "Capital raised (so far)", type: "text" },
  { id: "gbp_financial_burn_rate", label: "Monthly burn rate", type: "text" },
  { id: "gbp_financial_pre_money", label: "Pre-money valuation", type: "text" },
  { id: "gbp_financial_why_financing", label: "Why are you looking for financing?", type: "textarea", rows: 3 },
  { id: "gbp_financial_use_of_funds", label: "Specify the purpose of financing", type: "textarea", rows: 3 },
  { id: "gbp_financial_capital_seeking", label: "Capital seeking", type: "text" },
  { id: "gbp_financial_type_sought", label: "Type of financing sought", type: "textarea", rows: 3 },
  { id: "gbp_financial_projections", label: "Financial projections", type: "textarea", rows: 3 },
  { id: "gbp_financial_funds_raised", label: "Funds raised (amount, type, investor, date)", type: "textarea", rows: 3 }
];

function SectionHead({ kicker, title, badge }) {
  return (
    <div className="gbp-section-head">
      <div>
        {kicker ? <div className="gbp-kicker">{kicker}</div> : null}
        <h3>{title}</h3>
      </div>
      {badge ? <span className="badge">{badge}</span> : null}
    </div>
  );
}

function Callout({ title = "Did you know...?", children }) {
  return (
    <div className="gbp-callout">
      <strong>{title}</strong>
      {children}
    </div>
  );
}

export default function GreenBusinessPlanView({ answers, setA }) {
  const renderField = ({ id, label, helper, type = "textarea", rows = 4, options = [], placeholder }) => {
    const value = answers[id] || "";

    return (
      <div className="question-card" key={id}>
        <label htmlFor={id}><strong>{label}</strong></label>
        {helper ? <p className="question-description">{helper}</p> : null}
        {type === "select" ? (
          <select id={id} value={value} onChange={(event) => setA(id, event.target.value)}>
            <option value="">Select an option</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : type === "textarea" ? (
          <textarea
            id={id}
            rows={rows}
            value={value}
            onChange={(event) => setA(id, event.target.value)}
            placeholder={placeholder || ""}
          />
        ) : (
          <input
            id={id}
            type={type}
            value={value}
            onChange={(event) => setA(id, event.target.value)}
            placeholder={placeholder || ""}
          />
        )}
      </div>
    );
  };

  return (
    <div className="gbp-tool">
      <section className="card gbp-hero-card">
        <div className="gbp-hero-grid">
          <div>
            <div className="gbp-kicker">0 - Intro</div>
            <h3>Green Business Plan (GBP)</h3>
            <p>
              This tool will support you in creating and executing a successful Green Business Plan. Throughout the tool,
              you will be guided to write and execute your GBP in order to launch and run your sustainable business. You will
              find instructions and templates to fulfill your plan.
            </p>
            <ul className="gbp-list">
              {INTRO_POINTS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <figure className="gbp-media-frame">
            <img src="/ready.png" alt="Green business plan readiness" loading="lazy" />
          </figure>
        </div>
      </section>

      <section className="card gbp-section-card">
        <SectionHead kicker="1 - Launching your business" title="Launching your business" />
        <p>
          Your company has reached the implementation phase after successfully validating the ecological business model.
          Now, careful planning for the development and management of the company is necessary before proceeding to operations
          and launch.
        </p>
        <p>
          A multidimensional approach to planning impacts all major areas of a company, relying on various tools that work in
          harmony. Together, they provide comprehensive knowledge of how your company operates in the market, how to manage it,
          and how to boost its performance.
        </p>
        <p>
          Until now, you have been perfecting and testing the prototype. Now is the time to detail all aspects and expand the
          information available to build a solid and credible ecological business plan.
        </p>
        <p>
          When planning all aspects of your ecological company, schedule the actions that must be taken to start the company.
          Throughout the process, your roadmap should list and schedule the necessary tasks to implement the plan. Set start and
          end dates, assign a responsible person, and cover at least Year 0. It is also useful to establish strategic actions for
          Years 1, 2, and 3.
        </p>
        <Callout>
          <p>
            Many ecological companies only develop business plans when they have no other choice. Unless the bank or investors
            demand a plan, there is no plan. Do not leave the development of your plan for when you have time. The busier you are,
            the more you need to plan. If you are always putting out fires, build firebreaks or a sprinkler system.
          </p>
        </Callout>
        <Callout title="Roadmap reminder">
          <p>
            The roadmap is useful not only for immediate execution, but also for medium and long-term achievements. Think about
            brand creation and positioning. You cannot build your brand in just one year; it takes time and effort. Program your
            strategy with periodic steps over the next 2, 3, or even 5 years to strengthen your market niche.
          </p>
        </Callout>
      </section>

      <section className="card gbp-section-card">
        <SectionHead kicker="1.1 - Operation and Management Plan" title="Operation and management plan" />
        <div className="gbp-media-grid">
          <div>
            <p>
              This section is an overview of how your business will operate. Depending on the type of business, your operational
              plan will include how you manufacture goods, sell products, deliver services to customers, and manage staff to reach
              triple-bottom-line objectives.
            </p>
            <p>
              Triple bottom line is an accounting framework with three parts: social, environmental, and financial. Being a green,
              sustainable, and socially fair business goes far beyond offering a green product or service. You need internal
              operating principles that support your environmental and social initiatives.
            </p>
          </div>
          <figure className="gbp-media-frame">
            <img src={`${GBP_IMAGE_BASE}/operation.png`} alt="Operations plan illustration" loading="lazy" />
          </figure>
        </div>

        {renderField({
          id: "operationsPlan",
          label: "Operations and management plan overview",
          helper: "Summarize how the company will operate, deliver value, and manage resources day to day."
        })}

        <div className="gbp-subsection">
          <h4>1.1.1 - Management and problem solving activities</h4>
          <p>
            Management coordinates the efforts of people to accomplish goals and objectives by using available resources
            efficiently and effectively. It includes planning, organizing, staffing, leading, and controlling the organization.
          </p>
          <p>
            Problem solving includes the approaches that help you organize and prioritize how you deal with internal challenges.
          </p>
          {renderField({
            id: "gbp_management_problem_solving",
            label: "Please describe your management and problem solving activities"
          })}
        </div>

        <div className="gbp-subsection">
          <h4>1.1.2 - Human resources</h4>
          <p>
            Investors invest in people, not ideas. Describe why you are the right person to launch and manage this green business.
            Detail personal or professional experience related to the business topic and introduce key team members.
          </p>
          <Callout>
            <p>
              Calculate the number of full-time equivalent (FTE) job positions your business will create. Include brief
              descriptions of the positions, required skills, and any training you plan to offer.
            </p>
          </Callout>
          {renderField({
            id: "gbp_human_resources_policy",
            label: "Please describe your human resources policy"
          })}
        </div>

        <div className="gbp-subsection">
          <h4>1.1.3 - Physical assets</h4>
          <p>
            A physical asset is an item of economic, commercial, or exchange value with a tangible existence. For most
            businesses, physical assets include cash, equipment, inventory, and properties owned by the business.
          </p>
          <Callout>
            <p>
              You have previously described key resources. Retrieve and expand that information to list the assets that can help
              you now.
            </p>
          </Callout>
          {renderField({
            id: "gbp_physical_assets",
            label: "Please describe your physical assets"
          })}
        </div>

        <div className="gbp-subsection">
          <h4>1.1.4 - Intellectual resources</h4>
          <p>
            Intellectual resources are investments in brands, design, technology, or creative works. They include patents,
            domains, brands, software, publications, articles, new technologies, know-how, and more.
          </p>
          <Callout>
            <p>
              In the legal plan you will provide more information. Here, list and describe what you need and own for the business.
            </p>
          </Callout>
          {renderField({
            id: "gbp_intellectual_resources",
            label: "Please describe your intellectual resources"
          })}
        </div>

        <div className="gbp-subsection">
          <h4>1.1.5 - Production and suppliers</h4>
          <p>
            Green businesses maximize value for customers, stakeholders, and natural ecosystems while minimizing economic,
            social, and environmental costs. Production and supply chain management should focus on the business life cycle to
            spot critical points and promote innovative ways of doing business.
          </p>
          <p>
            Ecodesign helps include environmental criteria in the design stage of products, services, and business models. If you
            developed your Green Business Model within the platform, retrieve your ecodesign cards and analyze what can be
            improved.
          </p>
          <p>
            Creating a green and socially fair supply chain is critical to ensure you adhere to triple-bottom-line principles.
            One way to build a green supply chain is to develop criteria to select suppliers aligned with your mission.
          </p>
          <ul className="gbp-list">
            {PROCUREMENT_CRITERIA.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <Callout>
            <p>
              Some markets demand environmental labeling. Examples include the EU Ecolabel, Forest Stewardship Council (FSC), and
              LEED. You can explore them at{" "}
              <a href="http://www.ecolabelindex.com/" target="_blank" rel="noreferrer">ecolabelindex.com</a>. Social labels such as
              Fairtrade or conflict-free minerals may also be relevant.
            </p>
          </Callout>
          {renderField({
            id: "gbp_production_suppliers",
            label: "Please describe your production and suppliers policy"
          })}
        </div>
      </section>

      <section className="card gbp-section-card">
        <SectionHead kicker="1.2 - Marketing Plan" title="Marketing plan" />
        <div className="gbp-media-grid">
          <div>
            <p>
              The marketing plan details how you will reach target market segments, sell to those segments, set pricing, and
              define activities and partnerships needed for success.
            </p>
            <p>
              Your tactics are the means you will use to inform customers about your business and products. They should be spelled
              out with dates, actions, and the tools you will use.
            </p>
            <p>
              Green marketing adapts conventional marketing to environmental issues. It aims to highlight real environmental
              qualities, reduce greenwashing, and help customers understand the value of sustainable products and services.
            </p>
          </div>
          <figure className="gbp-media-frame">
            <img src={`${GBP_IMAGE_BASE}/marketing.png`} alt="Marketing plan illustration" loading="lazy" />
          </figure>
        </div>

        {renderField({
          id: "marketingStrategy",
          label: "Marketing plan overview",
          helper: "Summarize the overall marketing strategy, positioning, and tactical plan."
        })}

        <div className="gbp-subsection">
          <h4>1.2.1 - Customers and value proposition</h4>
          <p>
            Target customers are the pillar of your business idea. Describe them in depth, explain who makes decisions, and
            determine how you will reach them. Customers want the best deal at the best quality, and the value proposition is the
            promise you make to deliver that value.
          </p>
          <Callout>
            <p>
              A value proposition clearly identifies the benefits consumers get when buying your product or service. It should
              convince them it is better than alternatives and create competitive advantage.
            </p>
          </Callout>
          {renderField({
            id: "gbp_customers_value_proposition",
            label: "Please describe your customers and value proposition"
          })}
        </div>

        <div className="gbp-subsection">
          <h4>1.2.2 - Market analysis and competitors</h4>
          <p>
            Benchmark what is already in the market and explain what makes your solution different from existing alternatives.
            Clear differentiation is key to success.
          </p>
          {renderField({
            id: "marketAnalysis",
            label: "Please describe your market analysis and competitors"
          })}
        </div>

        <div className="gbp-subsection">
          <h4>1.2.3 - Product and services offer and pricing</h4>
          <p>
            Depending on your business, this section can be long or short. If you are creating a new product or service, explain
            its nature, uses, and value so readers can evaluate it.
          </p>
          <p>
            Ecological labels and declarations help consumers choose products based on environmental performance and avoid
            greenwashing.
          </p>
          <Callout>
            <p>
              Transparency and traceability are trending topics in green consumption. Describe the benefits you will provide.
            </p>
          </Callout>
          {renderField({
            id: "gbp_product_offer_pricing",
            label: "Please describe your offer and pricing for your products and services"
          })}
        </div>

        <div className="gbp-subsection">
          <h4>1.2.4 - Branding and positioning</h4>
          <p>
            Positioning is how you present your company to customers. Branding, pricing, and positioning are connected and should
            be developed together.
          </p>
          <Callout>
            <p>Use this formula to develop a positioning statement:</p>
            <p className="gbp-quote">
              For [target market] who [target market need], [this product] [how it meets the need]. Unlike [key competition], it
              [most important distinguishing feature].
            </p>
            <p className="gbp-quote">
              Example: For environmentally conscious travelers who want responsible holidays, the Green Ecolodge offers a complete
              green package of holidays, experiences, and learning. Unlike the local touristic offer, it lets guests enjoy a
              five-star holiday while preserving the environment and culture.
            </p>
          </Callout>
          {renderField({
            id: "gbp_branding_positioning",
            label: "Define your branding and positioning strategy"
          })}
        </div>

        <div className="gbp-subsection">
          <h4>1.2.5 - Communication channels</h4>
          <p>
            Channels include all means of communication and distribution to reach customers and deliver a value proposition.
            Communication is critical to convey the green value of your business.
          </p>
          <Callout>
            <p>When selecting a distribution channel, consider:</p>
            <ul className="gbp-list">
              {DISTRIBUTION_FACTORS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Callout>
          {renderField({
            id: "gbp_communication_channels",
            label: "Define your communication channels strategy"
          })}
        </div>

        <div className="gbp-subsection">
          <h4>1.2.6 - Customer relationship</h4>
          <p>
            Customer relationships cover the service and attention you provide before, during, and after a purchase. Transparency
            and traceability are pillars of trust and essential for long-term prosperity.
          </p>
          {renderField({
            id: "gbp_customer_relationships",
            label: "Define your customer relationship strategy"
          })}
        </div>
      </section>

      <section className="card gbp-section-card">
        <SectionHead kicker="1.3 - Financial Plan" title="Financial plan" />
        <div className="gbp-copy-stack">
          <p>
            Good bookkeeping keeps a business healthy. Your financial prospects should show that you have estimated the funds
            needed for the first four years (Year 0 is the pilot period, followed by Years 1-3 for stabilization and scale).
          </p>
          <p>
            The triple bottom line expands accounting to include social and environmental impacts, often called the three Ps:
            people, planet, and profit.
          </p>
        </div>
        <div className="gbp-media-row">
          <figure className="gbp-media-frame">
            <img src={`${GBP_IMAGE_BASE}/ppl.png`} alt="Triple bottom line" loading="lazy" />
          </figure>
          <figure className="gbp-media-frame">
            <img src={`${GBP_IMAGE_BASE}/financial.png`} alt="Financial plan illustration" loading="lazy" />
          </figure>
        </div>
        <p>Any green business plan should contain the following items:</p>
        <ul className="gbp-list">
          {FINANCIAL_ITEMS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <div className="gbp-subsection">
          <h4>1.3.1 - Setup costs and sources of capital</h4>
          <p>
            The initial investment to start a business may come from bank loans, government grants, outside investors, or the
            business owner. Impact investments are made with the intention to generate measurable social or environmental impact
            alongside a financial return.
          </p>
          <Callout>
            <p>
              Investors are very concerned about initial investments needed in the projects they support. Be clear about how you
              will address this essential issue.
            </p>
          </Callout>
          {renderField({
            id: "gbp_setup_costs_capital",
            label: "Describe the key setup costs and sources of capital"
          })}
        </div>

        <div className="gbp-subsection">
          <h4>1.3.2 - Income statement (Year 0)</h4>
          <p>
            The income statement lists revenue, costs, gross margin, operating expenses, and net income for Year 0 of operations.
          </p>
          <Callout>
            <p>Operating income - interest, taxes, depreciation, and amortization = net income.</p>
          </Callout>
          {renderField({
            id: "gbp_income_statement_y0",
            label: "Income statement (Year 0)",
            helper: "Describe the key financial items you consider necessary to run your business during the first year."
          })}
        </div>

        <div className="gbp-subsection">
          <h4>1.3.3 - Cash flow</h4>
          <p>
            Cash flow explains how much cash your business brings in, pays out, and the final cash balance by month. It is just as
            important as the income statement.
          </p>
          {renderField({
            id: "gbp_cash_flow",
            label: "Cash flow",
            helper: "Describe the expected cash flow levels of your business and how you will manage them."
          })}
        </div>

        <div className="gbp-subsection">
          <h4>1.3.4 - Balance sheet</h4>
          <p>
            The balance sheet is a snapshot of your financial position at a given moment. It includes assets, liabilities, and
            equity, and must balance according to the equation below.
          </p>
          <Callout>
            <p>Assets = liabilities + equity.</p>
          </Callout>
          {renderField({
            id: "gbp_balance_sheet",
            label: "Balance sheet forecast",
            helper: "Describe your expected balance sheet items and how they will balance."
          })}
        </div>

        <div className="gbp-subsection">
          <h4>1.3.5 - Break even analysis</h4>
          <p>
            Break-even analysis calculates how much you need to sell to cover all expenses. Understanding this section helps you
            make smarter decisions even if you outsource bookkeeping.
          </p>
          <Callout>
            <p>
              Your financial plan might feel overwhelming at first, but it is essential to understand these documents and make
              decisions based on what you learn.
            </p>
          </Callout>
          {renderField({
            id: "gbp_break_even",
            label: "Break-even analysis",
            helper: "Describe your break-even analysis and prove that your commercial strategy is viable."
          })}
        </div>

        <div className="gbp-subsection">
          <h4>1.3.6 - 3-year income statement</h4>
          <p>
            Sales forecasts and market growth projections help you anticipate future performance. There is no one-size-fits-all
            forecast, so segment it based on your business needs.
          </p>
          <Callout>
            <p>
              The sales forecast is a key part of your business plan, especially when lenders or investors are involved.
            </p>
          </Callout>
          {renderField({
            id: "financialForecast",
            label: "3-year income statement",
            helper: "Describe the key financial parameters you are considering for Years 1, 2, and 3."
          })}
        </div>

        <div className="gbp-subsection">
          <h4>1.3.7 - Additional data</h4>
          <p>
            Once you have income statement, cash flow, and balance sheet data, you can calculate standard business ratios such as
            gross margin, ROI, IRR, debt-to-equity, and liquidity ratios. You can also include impact metrics like SROI, energy
            footprint, biodiversity, and greenhouse gas emissions.
          </p>
          {renderField({
            id: "gbp_financial_accounting_break_even_details",
            label: "Financial accounting and break-even analysis",
            helper: "Calculate estimations with the spreadsheet template and explain them clearly."
          })}
          {renderField({
            id: "gbp_other_financial_metrics",
            label: "Other financial metrics",
            helper: "Explain to your investors the potential of your business."
          })}
        </div>
      </section>

      <section className="card gbp-section-card">
        <SectionHead kicker="1.4 - Legal Management Plan" title="Legal management plan" />
        <p>
          The legal management plan deals with all legal aspects related to your business, including the legal form it operates
          under. From a green business perspective, complying with environmental and labor regulations is a starting point, but
          voluntary schemes such as ISO 14000 series or EMAS certification can help you lead the sector.
        </p>
        <div className="gbp-subsection">
          <h4>Organizational level: setting the legal form</h4>
          <p>
            When you start a new business, one of the first decisions is how to structure the company. Typical legal forms include
            sole proprietorships, limited liability companies, cooperatives, partnerships, foundations, and associations.
          </p>
          <Callout>
            <p>
              The value created by your sustainable business can be fully or partly available as public domain, for example through
              Creative Commons licenses. Social enterprise statuses (such as Community Interest Company) and cooperatives are worth
              exploring.
            </p>
          </Callout>
          {renderField({
            id: "gbp_legal_organizational",
            label: "Please describe your legal strategy at organizational level"
          })}
        </div>

        <div className="gbp-subsection">
          <h4>Market level: patents, trading regulations, licenses, domains</h4>
          <p>
            If you are working with innovative technologies, intellectual resources, web domains, trademarks, or know-how, you
            should provide legal coverage to protect them.
          </p>
          <Callout>
            <p>
              Licensing trends include Copyleft and Open Source. Open source work can be freely accessed, used, changed, and shared
              by anyone. Learn more at{" "}
              <a href="https://opensource.org/faq#copyleft" target="_blank" rel="noreferrer">opensource.org</a>.
            </p>
          </Callout>
          {renderField({
            id: "gbp_legal_market",
            label: "Please describe your legal strategy at market level"
          })}
        </div>

        <div className="gbp-subsection">
          <h4>Territorial level: legal framework, environmental and labor laws</h4>
          <p>
            Your business will operate under local, regional, national, and international legal frameworks. You may need permits
            and must comply with regulations on environment, labor, safety, and trade.
          </p>
          <Callout>
            <p>
              In the PESTEL exercise you analyzed the legal context. Revisit it to understand how legal changes might affect your
              projections.
            </p>
          </Callout>
          {renderField({
            id: "gbp_legal_territorial",
            label: "Please describe how you will address local, regional, national, and international legal frameworks"
          })}
        </div>
      </section>

      <section className="card gbp-section-card">
        <SectionHead kicker="1.5 - Measuring and looking forward" title="Measuring and looking forward" />
        <p>
          Every project needs a serious management approach in order to succeed. Measuring progress toward business objectives is
          as critical as the results themselves. Define indicators, responsibilities, budgets, and milestones so you can track and
          follow up.
        </p>
        <div className="gbp-subsection">
          <h4>1.5.1 - Forecasting the future of the business</h4>
          <p>
            PESTEL analysis includes political, economic, social, technological, environmental, and legal aspects at local,
            regional, and global levels. Use it to foresee opportunities and avoid potential threats.
          </p>
          <Callout>
            <p>
              There are trends that can wipe out entire sectors quickly. Foreseeing what is coming can increase your success
              opportunities, especially in fast-changing industries.
            </p>
          </Callout>
          {renderField({
            id: "gbp_forecasting_future",
            label: "Forecasting the future of the business"
          })}
        </div>

        <div className="gbp-subsection">
          <h4>1.5.2 - Impact measurement and continuous improvement</h4>
          <p>
            Measuring impact is a must for green and social enterprises. It helps ensure coherence with the UN Sustainable
            Development Goals (SDGs) and supports continuous improvement.
          </p>
          <Callout>
            <p>
              Ecodesign cards provide qualitative evaluation of environmental performance. Life Cycle Assessment (LCA) tools offer
              quantitative indicators to compare and measure performance.
            </p>
          </Callout>
          {renderField({
            id: "impactGoals",
            label: "Impact measurement and continuous improvement"
          })}
        </div>
      </section>

      <section className="card gbp-section-card">
        <SectionHead kicker="1.6 - Executive Summary" title="Executive summary" />
        <p>
          Although the executive summary appears at the beginning of a finished plan, it is often written last. It should be
          short, enthusiastic, professional, and persuasive.
        </p>
        <Callout>
          <p>
            Your executive summary is your pitch. Introduce the business and the product or service, and convince readers to keep
            going.
          </p>
        </Callout>

        {renderField({
          id: "executiveSummary",
          label: "Executive summary",
          helper: "Provide the concise, investor-ready summary of your plan.",
          rows: 5
        })}

        <div className="gbp-grid-2">
          {renderField({ id: "gbp_vision", label: "Vision", type: "text" })}
          {renderField({ id: "gbp_mission", label: "Mission", type: "text" })}
          {renderField({ id: "gbp_objectives", label: "Objectives", type: "text" })}
          {renderField({ id: "gbp_value_proposition", label: "Value proposition", type: "text" })}
        </div>

        {renderField({
          id: "gbp_business_summary",
          label: "Business summary",
          helper: "Summarize the business, product/service, and the value it creates.",
          rows: 4
        })}
        {renderField({
          id: "gbp_testimony",
          label: "Testimony from the GE",
          helper: "Briefly describe how the program supported you in developing and creating your sustainable business.",
          rows: 3
        })}
        {renderField({
          id: "gbp_video_pitch_link",
          label: "Video pitch link",
          type: "url",
          placeholder: "https://"
        })}

        <div className="gbp-subsection">
          <h4>Organization overview</h4>
          <div className="gbp-grid-2">
            {ORG_OVERVIEW_FIELDS.map((field) => renderField(field))}
          </div>
        </div>

        <div className="gbp-subsection">
          <h4>Business overview</h4>
          <div className="gbp-grid-2">
            {BUSINESS_OVERVIEW_FIELDS.map((field) => renderField(field))}
          </div>
        </div>

        <div className="gbp-subsection">
          <h4>Financial information</h4>
          <div className="gbp-grid-2">
            {FINANCIAL_INFO_FIELDS.map((field) => renderField(field))}
          </div>
        </div>

        {renderField({
          id: "gbp_project_impact_indicators",
          label: "Project impact and indicators",
          rows: 4
        })}
      </section>

      <section className="card gbp-section-card">
        <SectionHead kicker="2 - The Business Take Off" title="The business take off" />
        <div className="gbp-media-grid">
          <div>
            <p>
              The execution stage is the time to put aside design and conceptual aspects and get your hands dirty by putting your
              products or services on the market. You have completed the GBP and the roadmap; now it is time to take real action.
            </p>
            <p>
              Do not hesitate. Observe, learn, and execute your roadmap. Keep tracking progress and adjust when needed, but do not
              forget why you scheduled it that way.
            </p>
            <p>
              The GBP and roadmap are your entrepreneurial map. You can change them a bit, taking other roads, but never forget
              where you are going.
            </p>
          </div>
          <figure className="gbp-media-frame gbp-rocket-frame">
            <img src={`${GBP_IMAGE_BASE}/rocket.png`} alt="Business take off" loading="lazy" />
          </figure>
        </div>
        {renderField({
          id: "gbp_execution_next_steps",
          label: "Execution roadmap - next steps",
          helper: "List the immediate actions you will execute, who owns them, and the timing.",
          rows: 4
        })}
      </section>

      <section className="card gbp-section-card">
        <SectionHead kicker="3 - Get Funded" title="Get funded" />
        <p>
          Funding is the act of providing financial resources to finance a need, program, or project. It is like getting the
          resources to build an engine and the fuel to run it. Getting funded requires effort, but it is often essential for
          growth.
        </p>
        <p>
          To be successful, identify the organizations and people who have investment capacity and are aligned with your values.
          Demonstrate economic feasibility and the environmental value you create.
        </p>
        <div className="gbp-funding-grid">
          {FUNDING_SOURCES.map((source) => (
            <article key={source.title} className="gbp-funding-card">
              <h4>{source.title}</h4>
              <p>{source.text}</p>
            </article>
          ))}
        </div>
        <p>
          Prepare to meet investors with a clear presentation supported by market needs and a solid business plan. Face-to-face
          meetings help, but video pitches can be effective for email outreach.
        </p>
        {renderField({
          id: "gbp_funding_strategy",
          label: "Funding strategy and investor outreach",
          helper: "Summarize the funding amount needed, sources you will target, and how you will engage investors.",
          rows: 4
        })}
      </section>
    </div>
  );
}
