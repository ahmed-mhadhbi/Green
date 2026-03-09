export default function OpenEcoInnovationPage() {
  return (
    <main className="open-page">
      <section className="open-hero">
        <div className="open-hero-inner">
          <div className="open-hero-left">
            <div className="open-hero-copy">
              <div className="open-kicker">The Green Impact</div>
              <h1>OPEN ECO-INNOVATION</h1>
              <p>The platform enabling connections to search for green business solutions.</p>
              <a href="#open-about" className="btn primary">Start here</a>
            </div>
            <div className="open-hero-panel">
              <h2>Open innovation for green entrepreneurship in the Mediterranean</h2>
              <p>
                Match seekers of green and circular solutions with startups and entrepreneurs able to propose
                practical, scalable responses.
              </p>
            </div>
          </div>
          <div className="open-hero-video-card">
            <video className="open-hero-video" autoPlay loop muted playsInline preload="metadata">
              <source src="/openEcoInovation/openVd.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      <section id="open-about" className="open-section">
        <div className="open-card">
          <div className="open-section-head">
            <div className="open-kicker">About</div>
            <h2>How the platform works</h2>
          </div>
          <div className="open-copy-grid">
            <p>
              The Green Impact Open Eco-Innovation is the platform that enables matching between seekers of green and
              circular business solutions (companies and public institutions) and providers (startups and
              entrepreneurs) using an open innovation approach.
            </p>
            <p>
              The participatory process starts with challenges set by drivers or enablers supporting project ideas and
              sustainable startups from both the public and private sectors in the Mediterranean area.
            </p>
            <p>
              All challenges respond to the objective of innovating in the sector of green entrepreneurship and
              circular economy. Entrepreneurs can submit proposals for one or more challenges, as individuals or on
              behalf of a group.
            </p>
          </div>
        </div>
      </section>

      <section className="open-section">
        <div className="open-framework">
          <div className="open-framework-copy">
            <div className="open-section-head">
              <div className="open-kicker">Methodological Framework</div>
              <h2>Open Innovation</h2>
            </div>
            <span className="badge">Enablers</span>
            <p>
              This novel tool was developed by the Regional Activity Centre for Sustainable Consumption and Production
              (SCP/RAC) within the framework of Rawafed, a programme funded by the European Union, and STAND Up!, an
              EU funded project under the ENI CBC Med Programme.
            </p>
            <p>
              The objective is to create demand for sustainable products and services from both companies and public
              entities, and to foster this demand through eco-innovation so organizations can integrate new green and
              circular solutions in their business models.
            </p>
          </div>
          <figure className="open-framework-media">
            <img src="/openEcoInovation/open.png" alt="Open eco-innovation enablers" loading="lazy" />
          </figure>
        </div>
      </section>
    </main>
  );
}
