import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getRoleLabel } from "../utils/roleLabels";

const HUB_NAV_ITEMS = [
  { key: "tools", title: "Tools", getTo: ({ toolsHref }) => toolsHref },
  { key: "products", title: "Products", getTo: ({ productsHref }) => productsHref },
  { key: "fund", title: "Fund", getTo: () => "/hub/fund" },
  { key: "community", title: "Community", getTo: () => "/hub/community" },
  { key: "policy", title: "Policy Hub", getTo: () => "/hub/policy" },
  { key: "ecosystems", title: "Ecosystems", getTo: () => "/hub/ecosystems" },
  { key: "open-eco-innovation", title: "Open Eco-innovation", getTo: () => "/hub/open-eco-innovation" },
];

export default function Home() {
  const statsRef = useRef(null);
  const hubRef = useRef(null);
  const { firebaseUser, profile, logout } = useAuth();
  const [showHubToolsPopup, setShowHubToolsPopup] = useState(false);
  const dashboardLabel = getRoleLabel(profile?.role, "Dashboard");
  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.querySelector(".navbar");
      if (!navbar) return;
      if (window.scrollY > 50) navbar.classList.add("scrolled");
      else navbar.classList.remove("scrolled");
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("animated");
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -100px 0px" }
    );

    document.querySelectorAll(".animate-on-scroll").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const animateCounter = (element, target, duration = 2000) => {
      let start = 0;
      const increment = target / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          element.textContent = target;
          clearInterval(timer);
        } else {
          element.textContent = Math.floor(start);
        }
      }, 16);
    };

    const statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const numbers = entry.target.querySelectorAll(".stat-number");
            numbers.forEach((num) => {
              const text = num.textContent;
              const value = parseInt(text.replace(/[^\d]/g, ""), 10);
              if (text.includes("%")) {
                const temp = document.createElement("span");
                temp.textContent = "0";
                num.textContent = "";
                num.appendChild(temp);
                animateCounter(temp, value);
                setTimeout(() => {
                  temp.textContent = `${value}%`;
                }, 2100);
              } else {
                animateCounter(num, value);
              }
            });
            statsObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) statsObserver.observe(statsRef.current);
    return () => statsObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!hubRef.current) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowHubToolsPopup(entry.isIntersecting);
      },
      { threshold: 0.2, rootMargin: "-8% 0px -38% 0px" }
    );

    observer.observe(hubRef.current);
    return () => observer.disconnect();
  }, []);

  const dashboardHref = firebaseUser ? "/dashboard" : "/login";
  const toolsHref = firebaseUser ? "/app/tools" : "/join-us";
  const productsHref = firebaseUser ? "/app/products" : "/join-us";

  return (
    <div>
      <nav className="navbar">
        <div className="nav-container">
          <a href="#home" className="logo" aria-label="Green Impact home">
            <img src="/images/y.jpg" alt="Green Impact" className="brand-logo-image" />
          </a>
          <ul className="nav-links">
            <li><a href="#home">Home</a></li>
            {!firebaseUser ? <li><a href="#join-us">Join Us</a></li> : null}
            <li><a href="#hub">Platform Hub</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#achievements">Achievements</a></li>
            <li><a href="#contact">Contact</a></li>
            {!firebaseUser ? (
              <li><a href="#join-us" className="login-btn">Login</a></li>
            ) : (
              <>
                <li><Link to={dashboardHref} className="login-btn">{dashboardLabel}</Link></li>
                <li><button className="home-signout-btn" onClick={logout}>Sign out</button></li>
              </>
            )}
          </ul>
        </div>
      </nav>

      <div className={`hub-tools-popup ${showHubToolsPopup ? "visible" : ""}`} aria-hidden={!showHubToolsPopup}>
        <div className="hub-tools-popup-head">
          <span>Tools navigator</span>
          <a href="#hub">Platform Hub</a>
        </div>
        <div className="hub-tools-popup-list">
          {HUB_NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              className="hub-tool-pill"
              to={item.getTo({ toolsHref, productsHref })}
            >
              {item.title}
            </Link>
          ))}
        </div>
      </div>

      <section className="institutional-support" id="home" aria-labelledby="institutional-support-title">
        <div className="institutional-support-inner animate-on-scroll">
          <div className="institutional-support-heading">
            <span>Avec le soutien de</span>
            <h2 id="institutional-support-title">Greenov&apos;i et ses partenaires institutionnels</h2>
          </div>
          <div className="institutional-logo-bar" aria-label="Partenaires du projet Greenov'i">
            <a href="https://greenovi.tn" target="_blank" rel="noreferrer" aria-label="Visiter le site de Greenov'i">
              <img src="/images/a.png" alt="Greenov'i" />
            </a>
            <a href="https://www.eeas.europa.eu/delegations/tunisia_fr?s=126" target="_blank" rel="noreferrer" aria-label="Visiter le site de l'Union européenne en Tunisie">
              <img src="/images/b.png" alt="Financé par l'Union européenne" />
            </a>
            <div className="institutional-logo-item">
              <img src="/images/c.jpg" alt="Tunisie Verte et Durable" />
            </div>
            <div className="institutional-logo-item institutional-logo-item-wide">
              <img src="/images/d.jpg" alt="France et Expertise France, Groupe AFD" />
            </div>
            <div className="institutional-logo-item">
              <img src="/images/e.png" alt="République Tunisienne" />
            </div>
          </div>
          <p className="institutional-boilerplate">
            Le projet Green Impact est soutenu par Greenov&apos;i, un projet financé par l’Union Européenne en Tunisie à travers le volet entrepreneuriat vert de son Programme «Tunisie Verte &amp; Durable » pour l’appui à l’action environnementale en Tunisie et mis en œuvre par Expertise France en collaboration avec le CITET Tunisia, le Ministère de l’Environnement et le Ministère de l’Economie et de la Planification.
          </p>
        </div>
      </section>

      <section className="hero">
        <video
          className="hero-video"
          src="/videos/bg.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="hero-overlay" />
        <div className="hero-glow hero-glow-left" />
        <div className="hero-glow hero-glow-right" />
        <div className="hero-content">
          <h1>Green Impact</h1>
          <p className="subtitle">The home of sustainable business</p>
          <a href="#hub" className="cta-button">Explore platform</a>
        </div>
      </section>

      <section className="platform-positioning" id="platform-purpose">
        <div className="section-header animate-on-scroll">
          <span className="section-eyebrow">One platform, a complete support journey</span>
          <h2>Built to turn green ideas into sustainable businesses</h2>
          <p>Green Impact brings guidance, practical tools, learning, mentoring and ecosystem connections together in one place.</p>
        </div>
        <div className="positioning-grid animate-on-scroll">
          <article className="positioning-card">
            <span className="positioning-number">01</span>
            <h3>Our main objective</h3>
            <p>Help green and circular initiatives move from an idea to a structured, viable and measurable-impact business.</p>
          </article>
          <article className="positioning-card">
            <span className="positioning-number">02</span>
            <h3>Who it is for</h3>
            <p>Entrepreneurs, companies, business support organizations, mentors, trainers, financial actors and policymakers in Tunisia.</p>
          </article>
          <article className="positioning-card">
            <span className="positioning-number">03</span>
            <h3>What users can do</h3>
            <p>Use guided business tools, follow learning paths, prepare documents, access mentoring and explore funding, policy and partnership resources.</p>
          </article>
        </div>
      </section>

      {!firebaseUser ? (
        <section className="join-section" id="join-us">
          <div className="section-header animate-on-scroll">
            <h2>Join Us</h2>
            <p>Choose your profile, fill the form, and apply in Tools.</p>
          </div>
          <div className="join-choice-grid animate-on-scroll">
            <Link to="/join-us?track=entrepreneur" className="join-choice">
              <img src="/images/Green%20Entrepreneur.webp" alt="Green entrepreneur registration" className="join-choice-image" />
              <h3>Green Entrepreneur registration</h3>
              <p>For entrepreneurs building sustainable and circular projects.</p>
            </Link>
            <Link to="/join-us?track=bso" className="join-choice">
              <img src="/images/buisness%20support.png" alt="Business support organization registration" className="join-choice-image" />
              <h3>Business support organization registration</h3>
              <p>For institutions and organizations with sustainable programs.</p>
            </Link>
            <Link to="/join-us?track=mentor" className="join-choice">
              <img src="/images/mentor.png" alt="Mentor registration" className="join-choice-image" />
              <h3>Trainer registration</h3>
              <p>For mentors and trainers supporting green businesses.</p>
            </Link>

          </div>
          <div className="join-actions">
            <Link to="/join-us" className="btn primary">Open Join Us forms</Link>
            <Link to="/login" className="btn">Already registered? Sign in</Link>
          </div>
        </section>
      ) : null}

      <section className="pathfinder" id="hub" ref={hubRef}>
        <div className="section-header hub-section-header animate-on-scroll">
          <h2>Platform Hub</h2>
          <p>Choose the support area that matches your next step. Every card now opens a dedicated space with practical information and clear actions.</p>
        </div>
        <div className="cards-grid hub-cards">
          <Link to={toolsHref} className="service-card animate-on-scroll hub-link-card">
            <span className="hub-card-tag">Core workspace</span>
            <div className="card-icon">
              <img src="/images/toolbox.png" alt="Tools" className="card-icon-image" />
            </div>
            <h3>Tools</h3>
            <p>Open the guided sustainable business tools and questionnaires.</p>
          </Link>
          <Link to={productsHref} className="service-card animate-on-scroll hub-link-card">
            <span className="hub-card-tag">Operations</span>
            <div className="card-icon">
              <img src="/images/product.avif" alt="Products" className="card-icon-image" />
            </div>
            <h3>Products</h3>
            <p>Access forms, workshops, application calls, and generated documents.</p>
          </Link>
          <Link to="/hub/fund" className="service-card animate-on-scroll hub-link-card">
            <span className="hub-card-tag">Funding</span>
            <div className="card-icon">
              <img src="/images/funds.png" alt="Fund" className="card-icon-image" />
            </div>
            <h3>Fund</h3>
            <p>Prepare for funding and understand pathways connecting sustainable businesses with financial actors in Tunisia.</p>
          </Link>
          <Link to="/hub/community" className="service-card animate-on-scroll hub-link-card">
            <span className="hub-card-tag">Network</span>
            <div className="card-icon">
              <img src="/images/community.png" alt="Community" className="card-icon-image" />
            </div>
            <h3>Community</h3>
            <p>Meet entrepreneurs, mentors and support organizations advancing sustainable businesses across Tunisia.</p>
          </Link>
          <Link to="/hub/policy" className="service-card animate-on-scroll hub-link-card">
            <span className="hub-card-tag">Insights</span>
            <div className="card-icon">
              <img src="/images/policy.png" alt="Policy Hub" className="card-icon-image" />
            </div>
            <h3>Policy Hub</h3>
            <p>Explore resources and dialogue around enabling policies for sustainable businesses in Tunisia.</p>
          </Link>
          <Link to="/hub/ecosystems" className="service-card animate-on-scroll hub-link-card">
            <span className="hub-card-tag">Ecosystem</span>
            <div className="card-icon">
              <img src="/images/ecosystems.png" alt="Ecosystems" className="card-icon-image" />
            </div>
            <h3>Ecosystems</h3>
            <p>Understand and strengthen the partnerships that support green and circular business development in Tunisia.</p>
          </Link>
          <Link to="/hub/open-eco-innovation" className="service-card animate-on-scroll hub-link-card">
            <span className="hub-card-tag">Innovation</span>
            <div className="card-icon">
              <img src="/images/open.png" alt="Open Eco-innovation" className="card-icon-image" />
            </div>
            <h3>Open Eco-innovation</h3>
            <p>Connect companies and institutions seeking green solutions with entrepreneurs ready to innovate.</p>
          </Link>
        </div>
      </section>

      <section className="about" id="about">
        <div className="about-content">
          <div className="about-text animate-on-scroll">
            <h2>About</h2>
            <p>
              <strong>GreenImpact</strong> belongs to The Green Impact Support Programme, an initiative which contributes to the 2030 Agenda for Sustainable Development and its SDGs by creating and enhancing sustainable businesses.
            </p>
            <p>
              In order to create an enabling ecosystem for sustainable enterprises, through The Green Impact Support Programme we work closely with green and circular entrepreneurs and companies, business support organizations, trainers and mentors, financial institutions, policy-makers and other relevant stakeholders.
            </p>
            <p>
              In national countries, we set up national Partnerships gathered under a common community of practices Business Support Organizations which targets sustainable entrepreneurs and companies.
            </p>
            <p>
              Our main targets are the Green Impact community, businesses implementing innovative ecological and social solutions that contribute to a switch to sustainable and fair consumption and production models.
            </p>
          </div>

          <div className="about-visual animate-on-scroll">
            <div className="visual-photo visual-photo-1">
              <img src="/images/about-visual1.jpg" alt="Reduce Reuse Recycle" />
            </div>
            <div className="visual-photo visual-photo-2">
              <img src="/images/about-visual2.jpg" alt="Green energy and plant growth" />
            </div>
            <div className="visual-photo visual-photo-3">
              <img src="/images/about-visual3.png" alt="Sustainable forest ecosystem" />
            </div>
          </div>
        </div>

        <div className="about-gallery animate-on-scroll">
          <div>
            <h4>We support you at every stage of development:</h4><br /><br />
            <img
              src="/images/about1.png"
              alt="Sustainable business development"
              className="about-gallery-image"
            />
          </div>
          <div>
            <h4>We provide The Green Impact community with a comprehensive set of services to design,</h4> <h4>develop and accelerate their green and circular businesses:</h4><br />
            <img
              src="/images/about2.png"
              alt="Green entrepreneurship"
              className="about-gallery-image"
            />
          </div>
        </div>
      </section>

      <section id="achievements">
        <div className="achievements-header animate-on-scroll">
          <h2>Achievements</h2>
        </div>

        <section className="stats" ref={statsRef}>
          <div className="stats-grid">
            {[
              { number: 630, label: "Entrepreneurs", desc: "Persons supported to develop their Sustainable Businesses." },
              { number: 12, label: "Trainers", desc: "Experts trained in Sustainable Business Model Development." },
              { number: 3, label: "BSO", desc: "Business Support Organizations members of the Green Impact Support Programme." },
              { number: 654, label: "Members", desc: "Eco-innovators of The GreenImpact community." },
              { number: "64%", label: "are women", desc: "% of supported entrepreneurs that are women" },
              { number: "70%", label: "are satisfied", desc: "% of entrepreneurs that are satisfied with the supporting services and tools" }
            ].map((stat, idx) => (
              <div key={idx} className="stat-item">
                <span className="stat-number">{stat.number}</span>
                <div className="stat-label">{stat.label}</div>
                <p className="stat-description">{stat.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </section>

      <section className="contact" id="contact">
        <div className="contact-container">
          <div className="contact-info animate-on-scroll">
            <h2>Contact us</h2>
            <div className="contact-item">
              <h3>Number</h3>
              <p>51266459</p>
            </div>
            <div className="contact-item">
              <h3>Localisation</h3>
              <p>Regueb , Sidi Bouzid , Tunis</p>
            </div>
            <div className="contact-item">
              <h3>Mail</h3>
              <p>
                <a href="mailto:association.rawafed1@gmail.com">association.rawafed1@gmail.com</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <img src="/images/y.jpg" alt="Green Impact" className="footer-brand-logo" />
          </div>
          <div className="footer-section">
            <h3>Quick links</h3>
            <ul className="footer-links">
              <li><a href="#home">Home</a></li>
              <li><a href="#hub">Platform Hub</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
              <li><a href="https://greenovi.tn" target="_blank" rel="noreferrer">Greenov&apos;i</a></li>
              <li><a href="https://www.eeas.europa.eu/delegations/tunisia_fr?s=126" target="_blank" rel="noreferrer">European Union in Tunisia</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Services</h3>
            <ul className="footer-links">
              <li><a href="#hub">Tools</a></li>
              <li><a href="#hub">Products</a></li>
              <li><a href="#hub">Community</a></li>
              <li><a href="#hub">Policy Hub</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Follow us</h3>
            <ul className="footer-links">
              <li><a href="#">Facebook</a></li>
              <li><a href="#">Twitter</a></li>
              <li><a href="#">LinkedIn</a></li>
              <li><a href="#">Instagram</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-lower">
            <div className="footer-lower-left">
              <div className="footer-credits">
                <p>Developed by:</p>
                <div className="footer-credit-images">
                  <img src="/images/x.png" alt="Developed by rawafed" className="footer-credit-image" />
                  <img src="/images/y.jpg" alt="Developed by Green impact" className="footer-credit-image" />
                </div>
              </div>
              <p>Funded by:</p>
              <div className="footer-partners">
                <img src="/images/a.png" alt="Partner a" className="footer-partner-image" />
                <img src="/images/b.png" alt="Partner b" className="footer-partner-image" />
                <img src="/images/c.jpg" alt="Partner c" className="footer-partner-image" />
                <img src="/images/d.jpg" alt="Partner d" className="footer-partner-image" />
                <img src="/images/e.png" alt="Partner e" className="footer-partner-image" />
              </div>
            </div>
          </div>
          <p>&copy; 2026 GreenImpact</p>
        </div>
      </footer>
    </div>
  );
}




