import React from "react";

const ACCESS_IMAGE_BASE = "/acces";

const INTRO_BENEFITS = [
  "Access your market with greater visibility.",
  "Reach your audiences with greater clarity.",
  "Create a bigger sustainability impact."
];

const MODULE_SECTIONS = [
  {
    title: "Brand essence",
    kicker: "Plant the seed!",
    description:
      "Align your green business with your brand essence and positioning.",
    modules: ["Aligning brand and business goals", "Developing your brand essence and positioning"]
  },
  {
    title: "Bringing your brand to life",
    kicker: "Make it real!",
    description:
      "Develop the visual and verbal identity that makes your sustainable offer feel tangible.",
    modules: ["Creating your visual identity", "Developing your narrative and key messages"]
  },
  {
    title: "Marketing and communications",
    kicker: "Reach out to your audiences!",
    description:
      "Plan the offline and digital channels that will reach your audiences where they are.",
    modules: ["Offline communications", "Digital communications"]
  },
  {
    title: "Partnerships",
    kicker: "Go beyond your borders!",
    description:
      "Create powerful partnerships to amplify your brand and grow your business.",
    modules: ["Stakeholder mapping for partnership creation", "Partnership activation"]
  }
];

const GLOSSARY = [
  {
    term: "Audience",
    definition:
      "An audience is formed by your potential consumers or the group of people to whom you direct your products or services. Groups of similar people within your audience can be represented by fictional profiles called personas."
  },
  {
    term: "Brand",
    definition:
      "A brand is a name, term, design, symbol, or other feature (or a combination of these) that identifies a maker's or seller's goods or services as distinct from those of other makers or sellers."
  },
  {
    term: "Brand essence",
    definition:
      "A brand essence is formed by the values and principles that each brand wants and is capable of representing. These remain unchanged over time and guide the growth of the business."
  },
  {
    term: "Brand positioning",
    definition:
      "Brand positioning is the strategy of making a unique impression in the minds of customers and at the marketplace. It should be desirable, specific, clear, and distinctive."
  },
  {
    term: "Brand space",
    definition:
      "Brand space is the potential value domain of your brand and is far larger than the served space of your current brand. It is the territory your brand could expand into."
  },
  {
    term: "Brand strategy",
    definition:
      "Brand strategy is the marketing practice of creating a name, symbol, design, words, or a combination of these that identify and differentiate a product from competitors."
  },
  {
    term: "Brand style guide",
    definition:
      "A brand style guide is a reference document that guides visual identity, language, templates, and approved statements so collaborators use brand elements consistently."
  },
  {
    term: "Brand identity",
    definition:
      "Brand identity is a set of tools or elements used by a company to create the brand's image. It includes the name, logo, slogan, colors, graphic styles, voice, and tone."
  },
  {
    term: "Circular economy",
    definition:
      "A circular economy aims to redefine growth by decoupling economic activity from finite resource consumption, designing waste out of the system, and regenerating natural systems."
  },
  {
    term: "Digital communications",
    definition:
      "Online communications are marketing actions done via the Internet, including email, online forums, social media, blogs, and video or audio through online conferences."
  },
  {
    term: "Key stakeholder",
    definition:
      "A key stakeholder is an agent or group related to the project, either because they are influenced by project objectives or because they have influence on them."
  },
  {
    term: "Logo",
    definition:
      "A logo is a graphic used as a dedicated visual to represent a company or brand and aid public identification and recognition."
  },
  {
    term: "Offline communications",
    definition:
      "Offline communications are marketing actions that do not involve the Internet, such as billboards, face-to-face interactions, print materials, television, and radio."
  },
  {
    term: "Positioning",
    definition:
      "Positioning helps a brand connect emotionally with its audience while highlighting what makes it unique and what competitors do not adequately address."
  },
  {
    term: "Storytelling",
    definition:
      "Storytelling is a marketing practice focused on crafting stories for your audience instead of listing facts or characteristics."
  },
  {
    term: "Strategic partnerships",
    definition:
      "A strategic partnership is a relationship with a key stakeholder in pursuit of common goals, aligned with your green entrepreneurial purpose and values."
  },
  {
    term: "Sustainable business",
    definition:
      "A sustainable business provides commercial solutions to environmental challenges which are economically viable and socially empowering."
  }
];

function SectionHead({ kicker, title, badge }) {
  return (
    <div className="atm-section-head">
      <div>
        {kicker ? <div className="atm-kicker">{kicker}</div> : null}
        <h3>{title}</h3>
      </div>
      {badge ? <span className="badge">{badge}</span> : null}
    </div>
  );
}

function Callout({ title = "Did you know...?", children }) {
  return (
    <div className="atm-callout">
      <strong>{title}</strong>
      {children}
    </div>
  );
}

function TemplateCard({ src, alt }) {
  return (
    <figure className="atm-template-card">
      <img src={src} alt={alt} loading="lazy" />
      <figcaption>Downloadable template</figcaption>
    </figure>
  );
}

export default function AccessToMarketView({ answers, setA }) {
  const renderField = ({ id, label, helper, type = "textarea", rows = 4, placeholder }) => {
    const value = answers[id] || "";

    return (
      <div className="question-card" key={id}>
        <label htmlFor={id}><strong>{label}</strong></label>
        {helper ? <p className="question-description">{helper}</p> : null}
        {type === "textarea" ? (
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
    <div className="atm-tool">
      <section className="card atm-hero-card">
        <div className="atm-kicker">Intro</div>
        <h3>Welcome to the Access to Market tool!</h3>
        <p>
          We live in a world of uninterrupted 24/7 communications, where people are exposed to thousands of brand messages a day.
          In this context, it is challenging to make your sustainable business brand, messaging, and value proposition stand out.
        </p>
        <p>
          As a Green Entrepreneur, you often need to do more with less. The Access to Market tool is here to assist you. It draws
          on proven tools and exercises to build a sound branding strategy with environmental values at the core of your brand
          essence. By crafting a message aligned with your sustainable mission, you:
        </p>
        <ul className="atm-list">
          {INTRO_BENEFITS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          Green businesses have a competitive advantage because environmental concern is pushing the market toward new habits and
          standards. Positioning as a green company may or may not sell more, but it sells better in a market saturated with less
          responsible alternatives. We encourage you to stand out by your sustainable brand essence.
        </p>
        <p>
          Regardless of your development stage, budget, or experience, this tool helps you shape a sustainable branding strategy
          that sets you apart. Are you ready? Let us get started.
        </p>
      </section>

      <section className="card atm-section-card">
        <SectionHead kicker="Modules" title="How to get started" />
        <p>
          There are several steps in developing your sustainable branding strategy. We recommend working through them with your
          team or collaborators. Because branding is about your stakeholders' perceptions, it is important to take their views
          into account.
        </p>
        <p>
          The Access to Market tool is organized into four sections: Brand Essence, Bringing your Brand to Life, Marketing and
          Communications Channels, and Partnerships and Internationalization. Each section contains two modules to assist you.
        </p>
        <div className="atm-module-grid">
          {MODULE_SECTIONS.map((section) => (
            <article key={section.title} className="atm-module-card">
              <div className="atm-kicker">{section.title}</div>
              <h4>{section.kicker}</h4>
              <p>{section.description}</p>
              <ul className="atm-list">
                {section.modules.map((module) => (
                  <li key={module}>{module}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <div className="atm-callout">
          <strong>Let's unleash the power of your sustainable brand!</strong>
        </div>
      </section>

      <section className="card atm-section-card">
        <SectionHead kicker="Brand essence" title="Aligning brand and business goals" badge="Module 1" />
        <p>
          Your sustainable brand conveys your mission, vision, and values to your audience. By aligning your brand with your
          business goals, you express what you want to achieve, for whom, and by what means.
        </p>
        <p>
          Start by integrating your mission, vision, and values into your sustainable brand proposition and by analyzing your
          journey so far.
        </p>
        <Callout title="Key learnings">
          <p>
            By the end of this module, you should be able to summarize your business and sustainable brand essence in one
            compelling sentence and define your genesis story as the foundation of your brand strategy.
          </p>
        </Callout>
        <h4>Integrate your mission into your green brand essence</h4>
        <p>
          Use the template to articulate why you do what you do, what you offer, and the impact you want to achieve. Use language
          that can be understood by all audiences.
        </p>
        <ol className="atm-steps">
          <li>Summarize your main challenge.</li>
          <li>Describe who you are and how you face this sustainability challenge.</li>
          <li>Explain what you do and your products or services.</li>
          <li>Define why it matters and what makes you different.</li>
          <li>Summarize your mission in a short, motivating sentence.</li>
        </ol>
        <div className="atm-grid-2">
          {renderField({
            id: "atm_challenge_summary",
            label: "1. Summarize your main challenge",
            helper: "Use language that is plain and easy to understand.",
            rows: 3
          })}
          {renderField({
            id: "atm_founder_story",
            label: "2. Who you are and how you face the challenge",
            helper: "Write about passions, expertise, vision, and what moved you to act.",
            rows: 3
          })}
          {renderField({
            id: "atm_offer_value_prop",
            label: "3. What you do and your sustainable value proposition",
            helper: "How do your products or services contribute to the challenge?",
            rows: 3
          })}
          {renderField({
            id: "atm_why_it_matters",
            label: "4. Why it matters",
            helper: "Why you? What is the impact of your venture?",
            rows: 3
          })}
          {renderField({
            id: "atm_mission_sentence",
            label: "5. Mission sentence",
            helper: "Summarize your mission in a short, compelling call to action.",
            rows: 2
          })}
        </div>
        <TemplateCard src={`${ACCESS_IMAGE_BASE}/dwewer.png`} alt="Mission template" />

        <h4>How has your journey been so far? Your genesis story</h4>
        <p>
          Remembering how, where, and why your adventure started can reignite passion and align your team and audiences with what
          inspired your business. Capture the milestones and key players that shaped your journey.
        </p>
        <ol className="atm-steps">
          <li>List remarkable milestones, launches, partnerships, or challenges.</li>
          <li>Identify the key players who shifted the trajectory of the company.</li>
          <li>Write your genesis story in a short paragraph.</li>
        </ol>
        <div className="atm-grid-2">
          {renderField({
            id: "atm_genesis_milestones",
            label: "Key milestones and dates",
            helper: "Launches, partnerships, products, and pivotal moments."
          })}
          {renderField({
            id: "atm_genesis_key_players",
            label: "Key players and influences",
            helper: "Who helped you get here and why they matter."
          })}
        </div>
        {renderField({
          id: "atm_genesis_story",
          label: "Genesis story paragraph",
          helper: "Write a short paragraph aligned with your brand story.",
          rows: 4
        })}
        <TemplateCard src={`${ACCESS_IMAGE_BASE}/sample.png`} alt="Genesis story template" />
      </section>

      <section className="card atm-section-card">
        <SectionHead kicker="Brand essence" title="Developing your brand essence and positioning" badge="Module 2" />
        <p>
          Defining your brand essence and positioning helps you visualize who you are, what you stand for, and what sets you apart
          from the competition. It enables you to communicate clearly to your audiences and to claim a unique space.
        </p>
        <Callout title="Key learnings">
          <p>
            By the end of this module, you should be able to assess your brand strengths and weaknesses, position your brand in the
            competitive landscape, and articulate your brand manifesto.
          </p>
        </Callout>
        <h4>Define your sustainable branding SWOT</h4>
        <p>
          Identify the key elements that distinguish your brand, spot gaps, and uncover opportunities to improve your branding.
        </p>
        <div className="atm-grid-2">
          {renderField({ id: "atm_swot_strengths", label: "Strengths", helper: "Unique differentiators and resources." })}
          {renderField({ id: "atm_swot_weaknesses", label: "Weaknesses", helper: "What is missing or weakening your brand?" })}
          {renderField({ id: "atm_swot_opportunities", label: "Opportunities", helper: "Trends or gaps you can capitalize on." })}
          {renderField({ id: "atm_swot_threats", label: "Threats", helper: "Market conditions that could hold you back." })}
        </div>
        <TemplateCard src={`${ACCESS_IMAGE_BASE}/yours.png`} alt="Brand SWOT template" />

        <h4>Find your sustainable brand space and positioning</h4>
        <ol className="atm-steps">
          <li>Plot your top two brand strengths on the horizontal and vertical axes.</li>
          <li>Position yourself in the quadrant and note your progress.</li>
          <li>Place competitors on the grid based on those strengths.</li>
          <li>If the space is crowded, revisit your strengths or message.</li>
        </ol>
        <div className="atm-grid-2">
          {renderField({
            id: "atm_positioning_top_strengths",
            label: "Top two brand strengths",
            helper: "What matters most to your audience and differentiates you?"
          })}
          {renderField({
            id: "atm_positioning_quadrant",
            label: "Positioning notes",
            helper: "Where do you and competitors sit on the grid?"
          })}
          {renderField({
            id: "atm_positioning_niche",
            label: "Niche and differentiation adjustments",
            helper: "What will you change if the space is crowded?"
          })}
        </div>
        <TemplateCard src={`${ACCESS_IMAGE_BASE}/dia.png`} alt="Brand positioning template" />

        <h4>Your brand manifesto</h4>
        <p>
          Your manifesto makes your ambitions tangible and actionable. Write it with your team and share it internally and
          externally.
        </p>
        {renderField({
          id: "atm_brand_manifesto",
          label: "Brand manifesto",
          helper: "Half a page to one page maximum.",
          rows: 6
        })}
      </section>

      <section className="card atm-section-card">
        <SectionHead kicker="Bringing your brand to life" title="Creating your visual identity" badge="Module 3" />
        <p>
          Your visual identity must be recognizable and aligned with who you are. Your logo is a key element, but your brand is
          more than a logo.
        </p>
        <Callout title="Key learnings">
          <p>
            By the end of this module, you should know the difference between a brand and a logo, how to test brand consistency,
            and how to create a sustainable brand style guide.
          </p>
        </Callout>
        <h4>Check your sustainable visual brand consistency</h4>
        <ol className="atm-steps">
          <li>Name: choose a meaningful name aligned with your values.</li>
          <li>Benchmarking: compare your logo to competitors or admired brands.</li>
          <li>Test your logo: check it in different sizes, colors, and applications.</li>
          <li>Visual identity: verify recognition even without the logo.</li>
        </ol>
        <div className="atm-grid-2">
          {renderField({
            id: "atm_brand_name_notes",
            label: "Brand name and meaning",
            helper: "What does your name communicate?"
          })}
          {renderField({
            id: "atm_logo_benchmarking",
            label: "Logo benchmarking",
            helper: "Key comparisons and insights."
          })}
          {renderField({
            id: "atm_logo_tests",
            label: "Logo tests",
            helper: "Where does it work well or fail?"
          })}
          {renderField({
            id: "atm_visual_identity_consistency",
            label: "Visual identity consistency check",
            helper: "Is it recognizable without the logo?"
          })}
        </div>

        <h4>Compile your sustainable brand style guide</h4>
        <p>
          A brand style guide ensures consistency across visuals, language, templates, and approved statements. It keeps brand
          elements in check for everyone who creates materials.
        </p>
        <div className="atm-grid-2">
          {renderField({
            id: "atm_style_guide_basics",
            label: "Brand names and contact details",
            helper: "Include business name versions, products, and contacts."
          })}
          {renderField({
            id: "atm_style_guide_visuals",
            label: "Visual identity elements",
            helper: "Logo rules, color palette, typography, and fonts."
          })}
          {renderField({
            id: "atm_style_guide_keywords",
            label: "Key words and concepts",
            helper: "What should people associate with your brand?"
          })}
          {renderField({
            id: "atm_style_guide_messages",
            label: "Key messages and tagline",
            helper: "Tagline, motto, and approved statements."
          })}
        </div>
      </section>

      <section className="card atm-section-card">
        <SectionHead kicker="Bringing your brand to life" title="Developing your narrative and key messages" badge="Module 4" />
        <p>
          Your verbal identity includes core messages, a brand narrative, and stories that are meaningful to your audiences. Keep
          messages simple, concrete, emotional, and data-informed.
        </p>
        <Callout title="Key learnings">
          <p>
            By the end of this module, you should be able to identify key audiences, craft core messages, and tell your sustainable
            story.
          </p>
        </Callout>

        <h4>Define your key audiences</h4>
        <p>
          Create personas for the three core audiences: early adopters, brand ambassadors, and future brand believers.
        </p>
        <div className="atm-grid-2">
          {renderField({
            id: "atm_audience_core",
            label: "Core constituents / early adopters",
            helper: "Who are your brand lovers and why?"
          })}
          {renderField({
            id: "atm_audience_ambassadors",
            label: "Supporters / brand ambassadors",
            helper: "Who will help spread the word?"
          })}
          {renderField({
            id: "atm_audience_future",
            label: "Future brand believers",
            helper: "Who will join when you scale?"
          })}
          {renderField({
            id: "targetMarket",
            label: "Priority target market",
            helper: "Keep your market focus clear and testable."
          })}
        </div>

        <h4>Craft your brand core messages</h4>
        <div className="atm-grid-2">
          {renderField({
            id: "atm_message_current",
            label: "How the public describes you today",
            helper: "If you have launched, what is the current perception?"
          })}
          {renderField({
            id: "atm_message_desired",
            label: "How you want to be described",
            helper: "Define the perception you want to shape."
          })}
          {renderField({
            id: "atm_message_avoid",
            label: "Interpretations to avoid",
            helper: "What should your audience not think?"
          })}
        </div>
        {renderField({
          id: "atm_message_three_sentences",
          label: "Three core message sentences",
          helper: "Write three compelling sentences that summarize your brand promise.",
          rows: 4
        })}

        <h4>Create your sustainable storytelling canvas</h4>
        <div className="atm-grid-2">
          {renderField({
            id: "atm_story_subject",
            label: "Subject and title",
            helper: "What is your story about?"
          })}
          {renderField({
            id: "atm_story_goals",
            label: "Goals",
            helper: "What should audiences feel, know, or do?"
          })}
          {renderField({
            id: "atm_story_audience",
            label: "Audience",
            helper: "Which personas are you speaking to?"
          })}
          {renderField({
            id: "atm_story_before_after",
            label: "Before and after",
            helper: "How should beliefs or emotions transform?"
          })}
          {renderField({
            id: "atm_story_scene",
            label: "Set the scene",
            helper: "Facts, places, and characters that create context."
          })}
          {renderField({
            id: "atm_story_key_messages",
            label: "Make your point",
            helper: "Key messages the audience needs to hear."
          })}
          {renderField({
            id: "atm_story_conclusion",
            label: "Conclusion and call to action",
            helper: "What is the next step you want your audience to take?"
          })}
        </div>
      </section>

      <section className="card atm-section-card">
        <SectionHead kicker="Marketing and communications" title="Offline communications" badge="Module 5" />
        <p>
          Offline communications include billboards, face-to-face interactions, print materials, television, and radio. The goal
          is to align your offline tools with your sustainable brand identity and measure results.
        </p>
        <ol className="atm-steps">
          <li>Identify audiences and goals for each tool.</li>
          <li>Outline budgets and timing.</li>
          <li>Gather feedback and measure results.</li>
          <li>Get inspiration from brands and campaigns you admire.</li>
        </ol>
        <div className="atm-grid-2">
          {renderField({
            id: "entryStrategy",
            label: "Market entry strategy",
            helper: "How will you convert early market opportunities?"
          })}
          {renderField({
            id: "salesChannels",
            label: "Priority sales channels",
            helper: "Which channels will drive the fastest traction?"
          })}
        </div>
        {renderField({
          id: "atm_offline_tool_mix",
          label: "Offline communications plan",
          helper: "Summarize tools, audiences, budget, and timing.",
          rows: 4
        })}
        {renderField({
          id: "atm_creative_brief",
          label: "Creative brief for communications campaign",
          helper: "Include objectives, target audience, messages, deliverables, and budget.",
          rows: 4
        })}
        {renderField({
          id: "atm_promo_materials",
          label: "Sustainable promotional materials checklist",
          helper: "Is it necessary? Is it recycled or sustainable? Is quantity optimized?"
        })}
        {renderField({
          id: "atm_packaging_practices",
          label: "Sustainable packaging practices",
          helper: "Outline how you will choose and use sustainable packaging."
        })}
      </section>

      <section className="card atm-section-card">
        <SectionHead kicker="Marketing and communications" title="Digital communications" badge="Module 6" />
        <p>
          Digital communications help you reach audiences directly through websites and social media. Build a strong presence and
          maintain consistent engagement.
        </p>
        {renderField({
          id: "atm_website_plan",
          label: "Website plan",
          helper: "Describe structure, content, UX, and key actions.",
          rows: 4
        })}
        <div className="atm-grid-2">
          {renderField({
            id: "atm_social_goals",
            label: "Social media goals",
            helper: "Define objectives aligned with business goals."
          })}
          {renderField({
            id: "atm_social_channels",
            label: "Social media channels",
            helper: "Where are your audiences most active?"
          })}
          {renderField({
            id: "atm_social_calendar",
            label: "Content and posting calendar",
            helper: "Plan cadence, themes, and formats."
          })}
          {renderField({
            id: "atm_social_metrics",
            label: "Analytics and measurement",
            helper: "How will you evaluate performance?"
          })}
        </div>
      </section>

      <section className="card atm-section-card">
        <SectionHead kicker="Partnerships" title="Stakeholder mapping for partnership creation" badge="Module 7" />
        <p>
          Mapping stakeholders helps you identify who can influence your business and who you should partner with. Prioritize
          stakeholders by interest and influence to build a clear partnership strategy.
        </p>
        <div className="atm-grid-2">
          {renderField({
            id: "atm_stakeholder_list",
            label: "Key external stakeholders",
            helper: "List customers, suppliers, communities, investors, peers, and agencies."
          })}
          {renderField({
            id: "atm_stakeholder_map",
            label: "Stakeholder map notes",
            helper: "Describe interest and influence levels."
          })}
          {renderField({
            id: "atm_stakeholder_priority",
            label: "Priority stakeholders",
            helper: "Who should you engage first and why?"
          })}
        </div>
      </section>

      <section className="card atm-section-card">
        <SectionHead kicker="Partnerships" title="Partnership activation" badge="Module 8" />
        <p>
          Evaluate barriers, risks, and opportunities for partnerships. Decide whether to formalize relationships and plan how to
          activate and evaluate them.
        </p>
        {renderField({
          id: "partnerships",
          label: "Partnership opportunities",
          helper: "Which partnerships will amplify your brand and growth?",
          rows: 4
        })}
        <div className="atm-grid-2">
          {renderField({
            id: "atm_partnership_benefits_risks",
            label: "Benefits and risks",
            helper: "List the key benefits and the risks to mitigate."
          })}
          {renderField({
            id: "atm_partnership_activation",
            label: "Activation and evaluation plan",
            helper: "How will you formalize, activate, and evaluate the partnership?"
          })}
        </div>
      </section>

      <section className="card atm-section-card">
        <SectionHead kicker="Resources" title="Glossary of key concepts" />
        <div className="atm-glossary-grid">
          {GLOSSARY.map((item) => (
            <details key={item.term} className="atm-glossary-item">
              <summary><strong>{item.term}</strong></summary>
              <p>{item.definition}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
