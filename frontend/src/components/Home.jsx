import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const statsRef = useRef(null);
  const { firebaseUser, profile, logout } = useAuth();
  const firstName = (profile?.name || firebaseUser?.displayName || "User").split(" ")[0];

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

  const toolsHref = firebaseUser ? "/app/tools" : "/join-us";
  const productsHref = firebaseUser ? "/app/products" : "/join-us";

  return (
    <div>
      <nav className="navbar">
        <div className="nav-container">
          <a href="#home" className="logo">Green<span>Impact</span></a>
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
                <li><span className="home-user-pill">{firstName}</span></li>
                <li><button className="home-signout-btn" onClick={logout}>Sign out</button></li>
              </>
            )}
          </ul>
        </div>
      </nav>

      <section className="hero" id="home">
        <div className="hero-content">
          <h1>Green Impact</h1>
          <p className="subtitle">The home of sustainable business</p>
          <a href="#hub" className="cta-button">Explore platform</a>
        </div>
      </section>

      {!firebaseUser ? (
        <section className="join-section" id="join-us">
          <div className="section-header animate-on-scroll">
            <h2>Join Us</h2>
            <p>Choose your profile, fill the form, and apply on Toolbox.</p>
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

      <section className="pathfinder" id="hub">
        <div className="section-header animate-on-scroll">
          <h2>Platform Hub</h2>
          <p>Go directly to your work areas.</p>
        </div>
        <div className="cards-grid hub-cards">
          <Link to={toolsHref} className="service-card animate-on-scroll hub-link-card">
            <div className="card-icon">T</div>
            <h3>Toolbox</h3>
            <p>Open the guided sustainable business tools and questionnaires.</p>
          </Link>
          <Link to={productsHref} className="service-card animate-on-scroll hub-link-card">
            <div className="card-icon">P</div>
            <h3>Products</h3>
            <p>Access forms, workshops, application calls, and generated documents.</p>
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
              In Mediterranean countries, we set up National Partnerships gathered under a common community of practices Business Support Organizations which targets sustainable entrepreneurs and companies.
            </p>
            <p>
              Our main targets are The Switchers, businesses implementing innovative ecological and social solutions that contribute to a switch to sustainable and fair consumption and production models.
            </p>
          </div>

          <div className="about-visual animate-on-scroll">
            <div className="visual-circle"></div>
            <div className="visual-circle"></div>
            <div className="visual-circle"></div>
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
            <h4>We provide The Switchers with a comprehensive set of services to design,</h4> <h4>develop and accelerate their green and circular businesses:</h4><br />
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
              { number: 3747, label: "Entrepreneurs", desc: "Persons supported to develop their Sustainable Businesses." },
              { number: 632, label: "Trainers", desc: "Experts trained in Sustainable Business Model Development." },
              { number: 125, label: "BSO", desc: "Business Support Organizations members of the Switchers Support Programme." },
              { number: 400, label: "Members", desc: "Eco-innovators of The GreenImpact community." },
              { number: "43%", label: "are women", desc: "% of supported entrepreneurs that are women" },
              { number: "85%", label: "are satisfied", desc: "% of entrepreneurs that are satisfied with the supporting services and tools" },
              { number: 162, label: "Sources", desc: "Sources of financing available in our database" },
              { number: 3.9, label: "Million", desc: "Million EUR raised by The Green Impact Fund" }
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
              <h3>Address</h3>
              <p>Passeig de la Zona Franca, 107 (Torre Ponent)<br />08038 Barcelona, Espagne</p>
            </div>
            <div className="contact-item">
              <h3>Email</h3>
              <p>
                <a href="mailto:medwaves.arc@gencat.cat">medwaves.arc@gencat.cat</a><br />
                <a href="mailto:support@theswitchers.org">support@theswitchers.org</a>
              </p>
            </div>
          </div>
          <form
            className="contact-form animate-on-scroll"
            onSubmit={(e) => {
              e.preventDefault();
              e.target.reset();
            }}
          >
            <div className="form-group">
              <label htmlFor="name">Username</label>
              <input type="text" id="name" name="name" required />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" required />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" required />
            </div>
            <button type="submit" className="submit-btn">Send message</button>
          </form>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Green Impact</h3>
            <p>An initiative of the UN Environment MAP Regional Activity Centre.</p>
          </div>
          <div className="footer-section">
            <h3>Quick links</h3>
            <ul className="footer-links">
              <li><a href="#home">Home</a></li>
              <li><a href="#hub">Platform Hub</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Services</h3>
            <ul className="footer-links">
              <li><a href="#hub">Toolbox</a></li>
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
          <p>&copy; 2026 GreenImpact | Privacy policy and legal notices</p>
        </div>
      </footer>
    </div>
  );
}
