import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const statsRef = useRef(null);

  // Navbar scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.querySelector(".navbar");
      if (window.scrollY > 50) navbar.classList.add("scrolled");
      else navbar.classList.remove("scrolled");
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth scrolling
  useEffect(() => {
    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute("href"));
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
    return () => anchors.forEach((anchor) => anchor.removeEventListener("click", () => {}));
  }, []);

  // Scroll animations
  useEffect(() => {
    const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -100px 0px" };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("animated");
      });
    }, observerOptions);

    document.querySelectorAll(".animate-on-scroll").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Stats counter animation
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
              const isPercentage = text.includes("%");
              const value = parseInt(text.replace(/[^\d]/g, ""));
              if (!isPercentage) animateCounter(num, value);
              else {
                const tempDiv = document.createElement("span");
                tempDiv.textContent = "0";
                num.textContent = "";
                num.appendChild(tempDiv);
                animateCounter(tempDiv, value);
                setTimeout(() => {
                  tempDiv.textContent = value + "%";
                }, 2100);
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

  return (
    <div>
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <a href="#home" className="logo">Green<span>Impact</span></a>
          <ul className="nav-links">
            <li><a href="#home">Home</a></li>
            <li><a href="#pathfinder">Pathfinder</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#achievements">Achievements</a></li>
            <li><a href="#contact">Contact</a></li>
            <li><Link to="/login" className="login-btn">Login / Register</Link></li>
          </ul>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero" id="home">
        <div className="hero-content">
          <h1>Green Impact</h1>
          <p className="subtitle">The home of sustainable business</p>
          <a href="#pathfinder" className="cta-button">Start Here</a>
        </div>
      </section>

      {/* Pathfinder Section */}
      <section className="pathfinder" id="pathfinder">
        <div className="section-header animate-on-scroll">
          <h2>Pathfinder</h2>
          <p>Find your path to sustainable business.</p>
        </div>
        <div className="cards-grid">
          {[
            { icon: "🛠️", title: "The Switchers Toolbox", desc: "Get free access to the most innovative set of methodologies and tools for sustainable business development." },
            { icon: "💰", title: "The Switchers Fund", desc: "Connecting sustainable businesses with financial actors in the Mediterranean." },
            { icon: "🌍", title: "The Switchers Community", desc: "Meet and join the inspiring community of sustainable businesses across the Mediterranean." },
            { icon: "📊", title: "The Switchers Policy Hub", desc: "Learn more about enabling policies for sustainable businesses in the Mediterranean." },
            { icon: "🛍️", title: "The Switchers Products", desc: "Find the products and services offered by sustainable businesses in the Mediterranean." },
            { icon: "💡", title: "Open Eco-Innovation", desc: "Connecting companies and entrepreneurs in the Mediterranean." },
          ].map((card, idx) => (
            <div key={idx} className="service-card animate-on-scroll">
              <div className="card-icon">{card.icon}</div>
              <h3>{card.title}</h3>
              <p>{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="about" id="about">
        <div className="about-content">
          <div className="about-text animate-on-scroll">
            <h2>About</h2>
            <p><strong>GreenImpact</strong> belongs to The Switchers Support Programme, an initiative which contributes to the 2030 Agenda for Sustainable Development and its SDGs by creating and enhancing sustainable businesses.</p>
            <p>In order to create an enabling ecosystem for sustainable enterprises, through The Switchers Support Programme we work closely with green and circular entrepreneurs and companies, business support organizations, trainers and mentors, financial institutions, policy-makers and other relevant stakeholders.</p>
            <p>In Mediterranean countries, we set up National Partnerships gathered under a common community of practices Business Support Organizations which targets sustainable entrepreneurs and companies.</p>
            <p>Our main targets are The Switchers, businesses implementing innovative ecological and social solutions that contribute to a switch to sustainable and fair consumption and production models. They are active in a variety of fields, including organic food, renewable energy, waste management, sustainable tourism, organic textile, sustainable building, organic cosmetics, and sustainable mobility, among others.</p>
          </div>
          <div className="about-visual animate-on-scroll">
            <div className="visual-circle"></div>
            <div className="visual-circle"></div>
            <div className="visual-circle"></div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats" id="achievements" ref={statsRef}>
        <div className="stats-grid">
          {[
            { number: 3747, label: "Entrepreneurs", desc: "Persons supported to develop their Sustainable Businesses." },
            { number: 632, label: "Trainers", desc: "Experts trained in Sustainable Business Model Development." },
            { number: 125, label: "BSO", desc: "Business Support Organizations members of the Switchers Support Programme." },
            { number: "85%", label: "are satisfied", desc: "% of entrepreneurs that are satisfied with the supporting services and tools" },
          ].map((stat, idx) => (
            <div key={idx} className="stat-item">
              <span className="stat-number">{stat.number}</span>
              <div className="stat-label">{stat.label}</div>
              <p className="stat-description">{stat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="contact" id="contact">
        <div className="contact-container">
          <div className="contact-info animate-on-scroll">
            <h2>Contact us</h2>
            <div className="contact-item">
              <h3>address</h3>
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
              alert("Votre message a été envoyé. Merci!");
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

      {/* Footer */}
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
              <li><a href="#pathfinder">Pathfinder</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Services</h3>
            <ul className="footer-links">
              <li><a href="#">Toolbox</a></li>
              <li><a href="#">Fund</a></li>
              <li><a href="#">Community</a></li>
              <li><a href="#">Policy Hub</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>follow us</h3>
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
