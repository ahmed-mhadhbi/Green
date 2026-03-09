const POLICY_OPTIONS = [
  {
    title: "Resources",
    image: "/policy/resources.png",
    alt: "Policy Hub resources",
    tag: "Knowledge base",
    description: "Browse policy resources, reference material, and practical tools for green and circular economy action."
  },
  {
    title: "Events",
    image: "/policy/Events.png",
    alt: "Policy Hub events",
    tag: "Peer learning",
    description: "Follow workshops, exchanges, and policy dialogues connecting actors across the Mediterranean."
  },
  {
    title: "News",
    image: "/policy/News.png",
    alt: "Policy Hub news",
    tag: "Latest updates",
    description: "Track recent announcements, stories, and developments related to enabling green businesses."
  }
];

export default function PolicyHubPage() {
  return (
    <main className="policy-page">
      <section className="policy-hero">
        <div className="policy-hero-inner">
          <div className="policy-hero-left">
            <div className="policy-hero-copy">
              <div className="policy-kicker">The Green Impact</div>
              <h1>POLICY HUB</h1>
              <p>
                The space for policymakers working for the green and circular economy transition in the Mediterranean.
              </p>
              <div className="policy-hero-actions">
                <a href="#policy-options" className="btn primary">Start here</a>
                <a href="#policy-about" className="btn">Learn more</a>
              </div>
              <div className="policy-signal-row">
                <span>Inclusive circular economy</span>
                <span>Peer learning</span>
                <span>Mediterranean cooperation</span>
              </div>
            </div>
            <div className="policy-hero-panel">
              <div className="policy-hero-points">
                <div className="policy-hero-point">
                  <strong>North and South shores</strong>
                  <span>Regional exchange across the Mediterranean basin.</span>
                </div>
                <div className="policy-hero-point">
                  <strong>Southern Med focus</strong>
                  <span>Support activities centered on practical needs in Tunisia and neighboring contexts.</span>
                </div>
                <div className="policy-hero-point">
                  <strong>Action-oriented</strong>
                  <span>Built to support legal and policy frameworks with real implementation value.</span>
                </div>
              </div>
            </div>
          </div>
          <div className="policy-hero-side">
            <div className="policy-hero-video-card">
              <video className="policy-hero-video" autoPlay loop muted playsInline preload="metadata">
                <source src="/policy/policyVd.mp4" type="video/mp4" />
              </video>
              <div className="policy-hero-video-copy">
                <span className="badge">Mediterranean policy space</span>
                <h2>Policy instruments that enable green and circular businesses</h2>
                <p>
                  Information exchange and peer learning designed to help countries build better enabling frameworks
                  for the transition.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="policy-options" className="policy-section">
        <div className="policy-section-head">
          <div className="policy-kicker">Start here</div>
          <h2>Explore the hub</h2>
          <p>Enter through the stream that fits your current work: reference material, live exchange, or updates.</p>
        </div>
        <div className="policy-options-grid">
          {POLICY_OPTIONS.map((option) => (
            <article key={option.title} className="policy-option-card">
              <figure className="policy-option-media">
                <img src={option.image} alt={option.alt} loading="lazy" />
                <span className="policy-option-tag">{option.tag}</span>
              </figure>
              <div className="policy-option-copy">
                <h3>{option.title}</h3>
                <p>{option.description}</p>
                <div className="policy-option-link">
                  <span>Open section</span>
                  <span aria-hidden="true">-&gt;</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="policy-about" className="policy-section">
        <div className="policy-about-card">
          <div className="policy-section-head">
            <div className="policy-kicker">About</div>
            <h2>The Green Impact Policy Hub</h2>
            <p>
              A shared space to strengthen enabling policy environments for green and circular businesses in the
              Mediterranean.
            </p>
          </div>
          <div className="policy-about-grid">
            <p>
              The Green Impact Policy Hub aims to support Mediterranean countries to have in place legal and policy
              frameworks enabling the switch to an inclusive circular economy.
            </p>
            <p>
              The Policy Hub will contribute to information exchange and peer learning on policy instruments to foster
              the development of green and circular businesses, key drivers for the green and circular economy in the
              Mediterranean region.
            </p>
            <p>
              Taking into account the existing needs, the Hub will include countries from both shores of the
              Mediterranean Sea, but will focus its support activities on Southern Med countries Tunisia.
            </p>
            <p>
              The Policy Hub is an initiative led by Rawafed, the UNEP/MAP Regional Activity Center for Sustainable
              Consumption and Production, as part of the EU-funded Greenovi Programme.
            </p>
          </div>
        </div>
      </section>

      <section className="policy-section">
        <div className="policy-contact-card">
          <div className="policy-section-head">
            <div className="policy-kicker">Contact us</div>
            <h2>Get in touch</h2>
          </div>
          <div className="policy-contact-grid">
            <div className="policy-contact-item">
              <span>Tel</span>
              <p>51266459</p>
            </div>
            <div className="policy-contact-item">
              <span>Address</span>
              <p>Regueb , Sidi Bouzid , Tunis</p>
            </div>
            <div className="policy-contact-item">
              <span>Email</span>
              <p>
                <a href="mailto:association.rawafed1@gmail.com">association.rawafed1@gmail.com</a>
              </p>
            </div>
          </div>
          <p className="policy-contact-note">For technical assistance, contact us:</p>
        </div>
      </section>
    </main>
  );
}
