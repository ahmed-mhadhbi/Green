import { useEffect } from "react";
import { Link } from "react-router-dom";

const HUB_CONTENT = {
  fund: {
    eyebrow: "Funding readiness",
    title: "Fund",
    intro: "A practical starting point for green and circular entrepreneurs preparing to finance their next stage of development.",
    audience: ["Green entrepreneurs", "Growing companies", "Business support organizations", "Financial partners"],
    features: [
      {
        title: "Assess readiness",
        text: "Clarify your business model, impact evidence, financial needs and the stage of funding that fits your project."
      },
      {
        title: "Build a stronger case",
        text: "Use Green Impact tools to structure assumptions, prepare working documents and communicate value to potential partners."
      },
      {
        title: "Navigate opportunities",
        text: "Understand the difference between grants, loans, investment and blended support before starting a conversation."
      }
    ],
    steps: ["Complete your business fundamentals", "Define the amount and purpose of funding", "Prepare evidence of commercial and environmental impact", "Approach the most relevant support or finance channel"],
    primary: { label: "Open business tools", to: "/join-us" }
  },
  community: {
    eyebrow: "People and peer support",
    title: "Community",
    intro: "The meeting point for the people and organizations building a stronger green entrepreneurship community in Tunisia.",
    audience: ["Entrepreneurs", "Mentors and trainers", "Support organizations", "Ecosystem partners"],
    features: [
      {
        title: "Find your peers",
        text: "Discover the roles and expertise present across the Green Impact community and identify useful connections."
      },
      {
        title: "Learn together",
        text: "Turn shared experience into practical learning through mentoring, workshops and peer exchange."
      },
      {
        title: "Create partnerships",
        text: "Connect complementary projects and support actors around concrete green and circular economy needs."
      }
    ],
    steps: ["Create the profile that matches your role", "Present your project, expertise or support offer", "Participate in learning and mentoring activities", "Build collaborations around shared challenges"],
    primary: { label: "Join the community", to: "/join-us" }
  },
  ecosystems: {
    eyebrow: "Partnerships for systemic impact",
    title: "Ecosystems",
    intro: "A shared view of the actors, capabilities and collaborations needed to help green and circular businesses thrive in Tunisia.",
    audience: ["Business support organizations", "Public institutions", "Finance actors", "Private-sector partners"],
    features: [
      {
        title: "Map the ecosystem",
        text: "Understand how entrepreneurs, support programs, public institutions, finance and markets contribute to the journey."
      },
      {
        title: "Spot collaboration gaps",
        text: "Identify where projects need stronger expertise, referrals, market access, policy support or financial connections."
      },
      {
        title: "Coordinate support",
        text: "Create clearer pathways between complementary organizations so entrepreneurs receive the right help at the right time."
      }
    ],
    steps: ["Identify the actors linked to a priority or territory", "Clarify each partner's role and contribution", "Connect services into an entrepreneur support pathway", "Track shared outcomes and improve coordination"],
    primary: { label: "Register as a support organization", to: "/join-us?track=bso" }
  }
};

export default function HubPlaceholderPage({ hubKey }) {
  const content = HUB_CONTENT[hubKey] || HUB_CONTENT.community;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [hubKey]);

  return (
    <main className="hub-detail-page">
      <header className="hub-detail-nav">
        <Link to="/home" className="hub-detail-brand" aria-label="Back to Green Impact home">
          <img src="/images/y.jpg" alt="Green Impact" />
        </Link>
        <Link to="/home#hub" className="hub-detail-back">Back to Platform Hub</Link>
      </header>

      <section className="hub-detail-hero">
        <div className="hub-detail-hero-copy">
          <span className="hub-detail-eyebrow">{content.eyebrow}</span>
          <h1>{content.title}</h1>
          <p>{content.intro}</p>
          <div className="hub-detail-actions">
            <Link to={content.primary.to} className="btn primary">{content.primary.label}</Link>
            <a href="mailto:association.rawafed1@gmail.com" className="btn">Talk to the Green Impact team</a>
          </div>
        </div>
        <aside className="hub-detail-audience" aria-label="Who this space is for">
          <span>Who it is for</span>
          <div className="hub-detail-audience-list">
            {content.audience.map((item) => <strong key={item}>{item}</strong>)}
          </div>
        </aside>
      </section>

      <section className="hub-detail-section">
        <div className="hub-detail-section-head">
          <span>Explore the space</span>
          <h2>What you will find here</h2>
        </div>
        <div className="hub-detail-feature-grid">
          {content.features.map((feature, index) => (
            <article className="hub-detail-feature" key={feature.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="hub-detail-section hub-detail-journey">
        <div className="hub-detail-section-head">
          <span>A clear path forward</span>
          <h2>How to use this space</h2>
        </div>
        <ol className="hub-detail-steps">
          {content.steps.map((step, index) => (
            <li key={step}>
              <span>{index + 1}</span>
              <p>{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="hub-detail-cta">
        <div>
          <span>Green Impact platform</span>
          <h2>Ready to take the next step?</h2>
          <p>Create the profile that fits your role or return to the Hub to explore another support area.</p>
        </div>
        <div className="hub-detail-actions">
          <Link to={content.primary.to} className="btn primary">{content.primary.label}</Link>
          <Link to="/home#hub" className="btn">Explore all Hub areas</Link>
        </div>
      </section>
    </main>
  );
}
